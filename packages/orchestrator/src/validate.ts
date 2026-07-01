import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

type Problem = { path: string; message: string };
const problems: Problem[] = [];

function dirs(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}

function requireFile(path: string): void {
  if (!existsSync(join(root, path))) problems.push({ path, message: 'Missing required file' });
}

function requireJson(path: string): void {
  const full = join(root, path);
  requireFile(path);
  if (!existsSync(full)) return;
  try { JSON.parse(readFileSync(full, 'utf8')); }
  catch { problems.push({ path, message: 'Invalid JSON' }); }
}

for (const skill of dirs(join(root, 'packages', 'skills'))) {
  requireFile(`packages/skills/${skill}/SKILL.md`);
  requireJson(`packages/skills/${skill}/skill.json`);
}

for (const agent of dirs(join(root, 'packages', 'senior-agents'))) {
  requireFile(`packages/senior-agents/${agent}/agent.md`);
  requireJson(`packages/senior-agents/${agent}/agent.json`);
  requireFile(`packages/senior-agents/${agent}/instructions.md`);
}

for (const engine of dirs(join(root, 'packages', 'decision-engines'))) {
  requireFile(`packages/decision-engines/${engine}/ENGINE.md`);
  requireJson(`packages/decision-engines/${engine}/engine.json`);
  requireFile(`packages/decision-engines/${engine}/rubric.md`);
}

if (problems.length) {
  console.error('Knowledge validation failed:');
  for (const problem of problems) console.error(`- ${problem.path}: ${problem.message}`);
  process.exit(1);
}

console.log('Knowledge validation passed.');
