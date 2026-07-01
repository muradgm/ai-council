#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/ai-providers/providers.index.json'), 'utf8'));
console.log('Provider health configuration');
for (const p of index.providers) {
  const configured = (p.env || []).some(key => Boolean(process.env[key]));
  const local = p.tier === 'local';
  console.log(`- ${p.id}: ${configured || local ? 'available/configurable' : 'missing env'} (${(p.env || []).join(', ') || 'no env'})`);
}
console.log('\nNote: health checks do not call external APIs. They only inspect local configuration.');
