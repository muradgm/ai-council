#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const dir = path.join(root, 'storage', 'observability', 'artifacts');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort() : [];
console.log(`Artifacts (${files.length})`);
for (const file of files.slice(-50)) {
  try {
    const r = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`- ${r.artifactPath} | ${r.artifactType} | ${r.summary}`);
  } catch {}
}
