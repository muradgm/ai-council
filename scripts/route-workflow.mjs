import fs from 'node:fs';
import path from 'node:path';

const query = process.argv.slice(2).join(' ').toLowerCase();
if (!query) {
  console.error('Usage: pnpm workflows:route "describe the task"');
  process.exit(1);
}

const root = process.cwd();
const workflows = JSON.parse(fs.readFileSync(path.join(root, 'packages', 'workflows', 'workflows.index.json'), 'utf8'));

function score(w) {
  let total = 0;
  const haystack = [w.name, w.title, w.category, w.description, ...(w.triggers || []), ...(w.outputs || [])].join(' ').toLowerCase();
  for (const word of query.split(/\W+/).filter(Boolean)) {
    if (haystack.includes(word)) total += 1;
  }
  for (const trigger of w.triggers || []) {
    if (query.includes(trigger.toLowerCase())) total += 5;
  }
  return total;
}

const ranked = workflows.map(w => ({ workflow: w, score: score(w) })).filter(x => x.score > 0).sort((a,b) => b.score - a.score).slice(0,5);
if (!ranked.length) {
  console.log('No strong workflow match. Default to project-kickoff or feature-planning depending on task scope.');
  process.exit(0);
}

for (const {workflow, score} of ranked) {
  console.log(`${workflow.name} (${workflow.category}) — score ${score}`);
  console.log(`  ${workflow.description}`);
  console.log(`  Agents: ${workflow.agents.join(', ')}`);
  console.log(`  Engines: ${workflow.decisionEngines.join(', ')}`);
}
