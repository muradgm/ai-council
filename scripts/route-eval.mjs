#!/usr/bin/env node
import { loadManifestCollection, scoreItem, writeText, nowIso } from './lib/council-utils.mjs';
const request = process.argv.slice(2).join(' ').trim();
if (!request) {
  console.error('Usage: node scripts/route-eval.mjs "<request>"');
  process.exit(1);
}
const suites = loadManifestCollection({ rel: 'packages/evals/suites', marker: 'SUITE.md', manifest: 'suite.json' });
const ranked = suites
  .map(suite => ({ ...suite, score: scoreItem(suite, request) }))
  .filter(suite => suite.score > 0)
  .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  .slice(0, 8);
console.log(`Eval route for: ${request}`);
if (!ranked.length) console.log('No strong eval suite match.');
for (const suite of ranked) console.log(`- ${suite.id} (${suite.score.toFixed(2)}) — ${suite.title || suite.name}`);
const md = `# Eval Route

Generated: ${nowIso()}

## Request

${request}

## Suites

${ranked.length ? ranked.map(s => `- ${s.id} — score ${s.score.toFixed(2)} — ${s.rel}`).join('\n') : 'No strong eval suite match.'}
`;
writeText('storage/evals/latest-eval-route.md', md);
console.log('\nSaved: storage/evals/latest-eval-route.md');
