#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const policy = process.argv[2] || 'model-routing-policy';
const file = path.join(root, 'packages/ai-providers/policies', `${policy}.md`);
if (!fs.existsSync(file)) {
  console.error(`Unknown policy: ${policy}`);
  console.error('Available policies:');
  for (const f of fs.readdirSync(path.join(root, 'packages/ai-providers/policies')).filter(x => x.endsWith('.md'))) console.error(`- ${f.replace(/\.md$/, '')}`);
  process.exit(1);
}
console.log(fs.readFileSync(file, 'utf8'));
