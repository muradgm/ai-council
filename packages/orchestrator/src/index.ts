import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function listDirectories(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function initCouncil(): void {
  const skills = listDirectories(join(root, 'packages', 'skills'));
  const agents = listDirectories(join(root, 'packages', 'senior-agents'));
  const engines = listDirectories(join(root, 'packages', 'decision-engines'));

  console.log('AI Council initialized');
  console.log(`Skills: ${skills.length}`);
  console.log(`Senior agents: ${agents.length}`);
  console.log(`Decision engines: ${engines.length}`);
  console.log('\nStart prompt:');
  console.log('Read AGENTS.md and packages/orchestrator/bootstrap.md, then initialize AI Council for this repository.');
}

function showPlan(): void {
  console.log('AI Council default execution plan:');
  console.log('1. Understand request');
  console.log('2. Locate project context');
  console.log('3. Select senior agents');
  console.log('4. Load required skills');
  console.log('5. Apply decision engines');
  console.log('6. Execute small changes');
  console.log('7. Validate and document');
}

const command = process.argv[2] ?? 'init';

if (command === 'init') initCouncil();
else if (command === 'plan') showPlan();
else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
