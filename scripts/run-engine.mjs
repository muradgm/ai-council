
import fs from 'node:fs';
import path from 'node:path';

const query = process.argv.slice(2).join(' ').trim();
if (!query) {
  console.error('Usage: pnpm engines:run "your decision question"');
  process.exit(1);
}

const root = process.cwd();
const indexPath = path.join(root, 'packages', 'decision-engines', 'index.json');
const registry = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

function score(engine) {
  const haystack = [engine.name, engine.title, engine.category, engine.decisionType, engine.purpose, ...(engine.tags ?? []), ...(engine.keywords ?? [])]
    .join(' ')
    .toLowerCase();
  const q = query.toLowerCase();
  const words = q.split(/[^a-z0-9+#.]+/).filter(Boolean);
  let score = 0;
  for (const word of words) if (haystack.includes(word)) score += 1;
  for (const keyword of engine.keywords ?? []) if (q.includes(keyword.toLowerCase())) score += 5;
  for (const tag of engine.tags ?? []) if (q.includes(tag.toLowerCase())) score += 3;
  return score;
}

const best = registry.engines
  .map(engine => ({ engine, score: score(engine) }))
  .sort((a, b) => b.score - a.score)[0]?.engine;

if (!best) {
  console.error('No decision engine found.');
  process.exit(1);
}

console.log(`# AI Council Decision Engine Run`);
console.log('');
console.log(`Decision question: ${query}`);
console.log(`Selected engine: ${best.name} — ${best.title}`);
console.log(`Engine path: packages/decision-engines/${best.name}/ENGINE.md`);
console.log('');
console.log('## Load order');
console.log('');
console.log(`1. packages/decision-engines/${best.name}/ENGINE.md`);
console.log(`2. packages/decision-engines/${best.name}/workflows/standard.workflow.md`);
console.log(`3. packages/decision-engines/${best.name}/rubrics/scoring-rubric.md`);
console.log(`4. packages/decision-engines/${best.name}/templates/decision-memo.template.md`);
console.log('');
console.log('## Suggested senior agents');
console.log('');
for (const agent of best.ownerAgents ?? []) console.log(`- ${agent}`);
console.log('');
console.log('## Suggested skills');
console.log('');
for (const skill of best.skills ?? []) console.log(`- ${skill}`);
console.log('');
console.log('## Required output');
console.log('');
console.log('Produce a decision memo with recommendation, options, rubric scores, tradeoffs, risks, confidence, next actions, and what would change the decision.');
