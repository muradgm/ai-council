
import fs from 'node:fs';
import path from 'node:path';

const query = process.argv.slice(2).join(' ').toLowerCase().trim();
if (!query) {
  console.error('Usage: pnpm engines:route "your decision question"');
  process.exit(1);
}

const root = process.cwd();
const indexPath = path.join(root, 'packages', 'decision-engines', 'index.json');
const registry = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

function score(engine) {
  const haystack = [engine.name, engine.title, engine.category, engine.decisionType, engine.purpose, ...(engine.tags ?? []), ...(engine.keywords ?? [])]
    .join(' ')
    .toLowerCase();
  const words = query.split(/[^a-z0-9+#.]+/).filter(Boolean);
  let score = 0;
  for (const word of words) {
    if (haystack.includes(word)) score += 1;
  }
  for (const keyword of engine.keywords ?? []) {
    if (query.includes(keyword.toLowerCase())) score += 5;
  }
  for (const tag of engine.tags ?? []) {
    if (query.includes(tag.toLowerCase())) score += 3;
  }
  return score;
}

const ranked = registry.engines
  .map(engine => ({ engine, score: score(engine) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);

console.log('Recommended decision engines:\n');
for (const { engine, score } of ranked) {
  console.log(`- ${engine.name} (${engine.title}) — score ${score}`);
  console.log(`  Category: ${engine.category}`);
  console.log(`  Use for: ${engine.decisionType}`);
  console.log(`  Path: packages/decision-engines/${engine.name}/ENGINE.md`);
}
