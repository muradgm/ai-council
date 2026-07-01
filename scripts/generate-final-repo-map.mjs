#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ignore = new Set(['node_modules', '.git', '.pnpm-store']);
const lines = ['# Final Repository Map', '', 'Generated local map for AI Council v2.0.0.', ''];
function walk(dir, depth = 0) {
  if (depth > 3) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !ignore.has(e.name))
    .sort((a,b) => (a.isFile() - b.isFile()) || a.name.localeCompare(b.name));
  for (const entry of entries) {
    const rel = path.relative(root, path.join(dir, entry.name));
    if (!rel) continue;
    lines.push(`${'  '.repeat(depth)}- ${entry.isDirectory() ? '📁' : '📄'} ${rel}`);
    if (entry.isDirectory()) walk(path.join(dir, entry.name), depth + 1);
  }
}
walk(root);
const out = path.join(root, 'docs/repo-map.final.md');
fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${path.relative(root, out)}`);
