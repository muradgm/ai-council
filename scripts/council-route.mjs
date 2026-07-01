#!/usr/bin/env node
import { routeRequest, writeText, nowIso } from './lib/council-utils.mjs';

const request = process.argv.slice(2).join(' ').trim();
if (!request) {
  console.error('Usage: node scripts/council-route.mjs "<request>"');
  process.exit(1);
}

const ranked = routeRequest(request, 6);
function section(title, items) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  if (!items.length) {
    console.log('No strong match.');
    return;
  }
  for (const item of items) console.log(`- ${item.id} (${item.score.toFixed(2)}) — ${item.title || item.name || item.category || item.rel}`);
}

console.log(`Council route for: ${request}`);
section('Senior agents', ranked.agents);
section('Decision engines', ranked.engines);
section('Workflows', ranked.workflows);
section('Skills', ranked.skills);
section('Templates', ranked.templates);

const md = `# Council Route\n\nGenerated: ${nowIso()}\n\n## Request\n\n${request}\n\n${Object.entries(ranked).map(([key, items]) => `## ${key}\n\n${items.length ? items.map(item => `- ${item.id} — score ${item.score.toFixed(2)} — ${item.rel}`).join('\n') : 'No strong match.'}`).join('\n\n')}\n`;
writeText('storage/context-packs/latest-route.md', md);
console.log('\nSaved: storage/context-packs/latest-route.md');
