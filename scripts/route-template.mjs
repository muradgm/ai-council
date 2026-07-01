import fs from 'node:fs';
import path from 'node:path';

const query = process.argv.slice(2).join(' ').toLowerCase();
if (!query) {
  console.error('Usage: pnpm templates:route "<request>"');
  process.exit(1);
}
const root = process.cwd();
const items = JSON.parse(fs.readFileSync(path.join(root, 'packages', 'templates', 'templates.index.json'), 'utf8'));
function score(item) {
  const hay = [item.name, item.title, item.category, ...(item.keywords || []), ...(item.skills || []), ...(item.agents || []), ...(item.decisionEngines || []), ...(item.workflows || [])].join(' ').toLowerCase();
  let s = 0;
  for (const token of query.split(/[^a-z0-9]+/).filter(Boolean)) {
    if (hay.includes(token)) s += token.length > 3 ? 2 : 1;
  }
  return s;
}
const ranked = items.map(item => ({ item, score: score(item) })).sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).slice(0, 8);
console.log(`Template route for: ${query}\n`);
for (const { item, score } of ranked) {
  console.log(`- ${item.name} (${item.category}) score=${score}`);
  console.log(`  ${item.entrypoint}`);
  console.log(`  agents: ${(item.agents || []).join(', ')}`);
  console.log(`  engines: ${(item.decisionEngines || []).join(', ')}`);
}
