#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const indexPath = path.join(root, 'packages/project-packs/project-packs.index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
for (const pack of index.packs) {
  console.log(`${pack.name}	${pack.title}	${pack.stage}`);
}
