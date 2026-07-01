#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/ai-providers/providers.index.json'), 'utf8'));
console.log(`AI Providers (${index.providers.length})`);
for (const p of index.providers) {
  console.log(`- ${p.id} | ${p.tier} | ${p.name} | ${p.strengths.slice(0,3).join(', ')}`);
}
