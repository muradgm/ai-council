#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const base = path.join(root, 'storage', 'observability');
const dirs = ['runs','traces','provider-calls','costs','artifacts','diagnostics','reports','incidents'];
function countJson(dir) {
  const full = path.join(base, dir);
  if (!fs.existsSync(full)) return 0;
  return fs.readdirSync(full).filter(f => f.endsWith('.json')).length;
}
console.log('Observability status');
console.log('--------------------');
for (const dir of dirs) console.log(`${dir}: ${countJson(dir)}`);
