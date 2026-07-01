#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/project-packs/project-packs.index.json'), 'utf8'));
function copyIfExists(from, to) {
  const src = path.join(root, from);
  const dst = path.join(root, to);
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return true;
}
for (const pack of index.packs) {
  fs.mkdirSync(path.join(root, pack.projectRoot), { recursive: true });
  copyIfExists(`packages/project-packs/${pack.name}/PROJECT_PACK.md`, `${pack.projectRoot}/PROJECT_PACK.md`);
  copyIfExists(`packages/project-packs/${pack.name}/codex/CODEX_CONTEXT.md`, `${pack.projectRoot}/codex/CODEX_CONTEXT.md`);
  copyIfExists(`packages/project-packs/${pack.name}/tasks/ACTIVE_TASKS.md`, `${pack.projectRoot}/tasks/ACTIVE_TASKS.md`);
  copyIfExists(`packages/project-packs/${pack.name}/decisions/DECISION_LOG.md`, `${pack.projectRoot}/decisions/DECISION_LOG.md`);
}
console.log(`Synced ${index.packs.length} project packs into projects/`);
