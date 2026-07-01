#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/project-packs/project-packs.index.json'), 'utf8'));
let ok = true;
console.log(`Project packs: ${index.packs.length}`);
for (const pack of index.packs) {
  const required = [
    `packages/project-packs/${pack.name}/PROJECT_PACK.md`,
    `packages/project-packs/${pack.name}/project-pack.json`,
    `packages/project-packs/${pack.name}/codex/CODEX_CONTEXT.md`,
    `packages/project-packs/${pack.name}/tasks/ACTIVE_TASKS.md`,
    `packages/project-packs/${pack.name}/risks/RISK_REGISTER.md`,
    pack.projectRoot,
    `${pack.projectRoot}/PROJECT.md`,
    `${pack.memoryRoot}/project-context.md`
  ];
  const missing = required.filter(rel => !fs.existsSync(path.join(root, rel)));
  if (missing.length) ok = false;
  console.log(`${missing.length ? 'FAIL' : 'OK'} ${pack.name} — ${pack.title}`);
  for (const rel of missing) console.log(`  missing: ${rel}`);
}
process.exitCode = ok ? 0 : 1;
