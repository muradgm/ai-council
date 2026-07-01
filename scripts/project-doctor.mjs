#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { projectCandidates, root, toSlug } from './lib/council-utils.mjs';

const [name] = process.argv.slice(2);
if (!name) {
  console.error('Usage: node scripts/project-doctor.mjs <project>');
  process.exit(1);
}
const candidates = projectCandidates(name);
let failed = false;
function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed = true;
}
console.log(`Project doctor: ${name}`);
console.log('-----------------------');
check('Found project or memory candidate', candidates.length > 0, candidates.map(c => c.rel).join(', '));
for (const c of candidates) {
  if (c.type === 'project') {
    check(`${c.rel}/README.md`, fs.existsSync(path.join(root, c.rel, 'README.md')));
    check(`${c.rel}/project.ai.config.ts`, fs.existsSync(path.join(root, c.rel, 'project.ai.config.ts')));
  }
  if (c.type === 'memory') {
    check(`${c.rel}/project-context.md`, fs.existsSync(path.join(root, c.rel, 'project-context.md')));
  }
}
if (failed) process.exit(1);
