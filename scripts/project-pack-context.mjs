#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const [projectArg, ...taskParts] = process.argv.slice(2);
const task = taskParts.join(' ') || 'No task provided';
if (!projectArg) {
  console.error('Usage: pnpm project-pack:context <project> "task"');
  process.exit(1);
}
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/project-packs/project-packs.index.json'), 'utf8'));
const normalized = projectArg.toLowerCase();
const pack = index.packs.find(p => p.name === normalized || p.title.toLowerCase().includes(normalized));
if (!pack) {
  console.error(`Unknown project pack: ${projectArg}`);
  console.error(`Available: ${index.packs.map(p => p.name).join(', ')}`);
  process.exit(1);
}
function read(rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : `Missing: ${rel}`;
}
const sections = [
  ['AGENTS', 'AGENTS.md'],
  ['ORCHESTRATOR BOOTSTRAP', 'packages/orchestrator/bootstrap.md'],
  ['PROJECT PACK', `packages/project-packs/${pack.name}/PROJECT_PACK.md`],
  ['CODEX CONTEXT', `packages/project-packs/${pack.name}/codex/CODEX_CONTEXT.md`],
  ['ACTIVE TASKS', `packages/project-packs/${pack.name}/tasks/ACTIVE_TASKS.md`],
  ['DECISION LOG', `packages/project-packs/${pack.name}/decisions/DECISION_LOG.md`],
  ['RISK REGISTER', `packages/project-packs/${pack.name}/risks/RISK_REGISTER.md`],
  ['PROJECT MEMORY', `${pack.memoryRoot}/project-context.md`]
];
console.log(`# AI Council Codex Context Pack
`);
console.log(`Project: ${pack.title}`);
console.log(`Task: ${task}`);
console.log(`Generated: ${new Date().toISOString()}
`);
console.log(`## Operating Instruction
`);
console.log(`Use the project pack as source of truth. Route the task through the listed agents, skills, decision engines, workflows, and templates before editing code.
`);
for (const [label, rel] of sections) {
  console.log(`
---

## ${label}

Source: \`${rel}\`
`);
  console.log(read(rel));
}
