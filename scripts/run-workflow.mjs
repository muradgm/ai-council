import fs from 'node:fs';
import path from 'node:path';

const input = process.argv.slice(2).join(' ');
if (!input) {
  console.error('Usage: pnpm workflows:run "workflow-name or task description"');
  process.exit(1);
}

const root = process.cwd();
const workflows = JSON.parse(fs.readFileSync(path.join(root, 'packages', 'workflows', 'workflows.index.json'), 'utf8'));

function score(w, query) {
  query = query.toLowerCase();
  if (w.name === input) return 999;
  let total = 0;
  const haystack = [w.name, w.title, w.category, w.description, ...(w.triggers || [])].join(' ').toLowerCase();
  for (const word of query.split(/\W+/).filter(Boolean)) if (haystack.includes(word)) total++;
  for (const trigger of w.triggers || []) if (query.includes(trigger.toLowerCase())) total += 5;
  return total;
}

const selected = workflows.map(w => ({w, s: score(w, input)})).sort((a,b)=>b.s-a.s)[0]?.w;
if (!selected) {
  console.error('No workflow selected.');
  process.exit(1);
}

console.log(`# AI Council Workflow Run`);
console.log(`
## Selected workflow
`);
console.log(`- Name: ${selected.name}`);
console.log(`- Title: ${selected.title}`);
console.log(`- Category: ${selected.category}`);
console.log(`- Entrypoint: packages/workflows/${selected.name}/WORKFLOW.md`);
console.log(`
## Description
`);
console.log(selected.description);
console.log(`
## Load these agents
`);
for (const agent of selected.agents) console.log(`- packages/senior-agents/${agent}/AGENT.md`);
console.log(`
## Load these skills
`);
for (const skill of selected.skills) console.log(`- packages/skills/${skill}/SKILL.md`);
console.log(`
## Run these decision engines when tradeoffs matter
`);
for (const engine of selected.decisionEngines) console.log(`- packages/decision-engines/${engine}/ENGINE.md`);
console.log(`
## Execute phases
`);
for (const phase of selected.phases) console.log(`- packages/workflows/${selected.name}/phases/${phase}.md`);
console.log(`
## Expected outputs
`);
for (const output of selected.outputs) console.log(`- ${output}`);
console.log(`
## Safety boundary
`);
console.log(selected.safety);
console.log(`
## Next instruction for Codex
`);
console.log(`Read packages/workflows/${selected.name}/prompts/invoke.prompt.md, then execute this workflow against the current repository task.`);
