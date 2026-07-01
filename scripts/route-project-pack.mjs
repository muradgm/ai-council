#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const request = process.argv.slice(2).join(' ').toLowerCase();
if (!request) {
  console.error('Usage: pnpm project-packs:route "request"');
  process.exit(1);
}
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/project-packs/project-packs.index.json'), 'utf8'));
function score(pack) {
  const hay = [pack.name, pack.title, pack.kind, pack.wedge, pack.stage, ...(pack.keywords || []), ...(pack.skills || []), ...(pack.agents || [])].join(' ').toLowerCase();
  const words = request.split(/[^a-z0-9+#.]+/).filter(w => w.length > 2);
  let score = 0;
  for (const word of words) if (hay.includes(word) || hay.includes(word.replace(/s$/, ''))) score += 1;
  const boosts = [
    [['trade','trading','forex','journal','risk'], 'tradeframe', 8],
    [['signal','outreach','lead','audit','scrape','revenue'], 'signalscout', 8],
    [['travel','route','city','trip','family','basel','navo','flowday'], 'navo', 8],
    [['swim','pool','swimming','berlin'], 'swimly', 8]
  ];
  for (const [terms, target, amount] of boosts) {
    if (terms.some(t => request.includes(t)) && pack.name === target) score += amount;
  }
  return score;
}
const ranked = index.packs.map(pack => ({...pack, score: score(pack)})).sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));
console.log(JSON.stringify({ request, recommendations: ranked.filter(p => p.score > 0).slice(0, 4) }, null, 2));
