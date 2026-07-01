import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const command = process.argv[2] ?? 'help';
const rest = process.argv.slice(3);

function countDirs(path: string, marker?: string): number {
  if (!existsSync(path)) return 0;
  return readdirSync(path, { withFileTypes: true }).filter((entry) => {
    if (!entry.isDirectory()) return false;
    if (!marker) return true;
    return existsSync(join(path, entry.name, marker));
  }).length;
}

function help(): void {
  console.log('AI Council CLI');
  console.log('');
  console.log('Commands:');
  console.log('  init       Initialize council context');
  console.log('  status     Show repository knowledge counts');
  console.log('  plan       Show default orchestration plan');
  console.log('  engines    Show decision-engine count');
  console.log('  workflows  Show workflow count');
}

function init(): void {
  console.log('AI Council initialized.');
  console.log('Read AGENTS.md and packages/orchestrator/bootstrap.md before executing tasks.');
}

function status(): void {
  console.log(`Skills: ${countDirs(join(root, 'packages', 'skills'), 'SKILL.md')}`);
  console.log(`Senior agents: ${countDirs(join(root, 'packages', 'senior-agents'), 'AGENT.md')}`);
  console.log(`Decision engines: ${countDirs(join(root, 'packages', 'decision-engines'), 'ENGINE.md')}`);
  console.log(`Workflows: ${countDirs(join(root, 'packages', 'workflows'), 'WORKFLOW.md')}`);
}

function plan(): void {
  console.log('1. Understand request');
  console.log('2. Locate project');
  console.log('3. Select senior agents');
  console.log('4. Select decision engine when tradeoffs matter');
  console.log('5. Load required skills only');
  console.log('6. Produce plan or decision memo');
  console.log('7. Execute');
  console.log('8. Validate and document');
}

function engines(): void {
  console.log(`Decision engines: ${countDirs(join(root, 'packages', 'decision-engines'), 'ENGINE.md')}`);
  console.log('Use: pnpm engines:list, pnpm engines:route "...", pnpm engines:run "..."');
}

if (command === 'help') help();
else if (command === 'init') init();
else if (command === 'status') status();
else if (command === 'plan') plan();
else if (command === 'engines') engines();
else if (command === 'workflows') workflows();
else {
  console.error(`Unknown command: ${command}`);
  help();
  process.exit(1);
}


function workflows(): void {
  console.log(`Workflows: ${countDirs(join(root, 'packages', 'workflows'), 'WORKFLOW.md')}`);
  console.log('Use: pnpm workflows:list, pnpm workflows:route "...", pnpm workflows:run "..."');
}


// Phase 7 runtime note:
// Use package scripts for memory runtime commands:
// - pnpm memory:init
// - pnpm memory:status
// - pnpm project:context <project>
// - pnpm memory:context <project> "task"
// - pnpm memory:decision <project> "decision" "rationale"
// - pnpm memory:session <project> "summary"
