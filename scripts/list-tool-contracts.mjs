#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/tool-contracts/tools.index.json'), 'utf8'));
console.log(`Tool contracts (${index.contracts.length})`);
for (const t of index.contracts) console.log(`- ${t.name} — ${t.title}: ${t.description}`);
