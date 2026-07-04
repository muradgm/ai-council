import fs from "node:fs";
import path from "node:path";

function backupId() {
  return `backup-${new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").replace("Z", "")}`;
}

export function createFileBackup(root: string, rel: string, runId: string) {
  const source = path.join(root, rel);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) return undefined;

  const backupRel = path.join("storage/governance/action-backups", runId || backupId(), rel).replaceAll(path.sep, "/");
  const backupFull = path.join(root, backupRel);
  fs.mkdirSync(path.dirname(backupFull), { recursive: true });
  fs.copyFileSync(source, backupFull);
  return backupRel;
}
