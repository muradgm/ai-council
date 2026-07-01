#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const scripts = Object.entries(pkg.scripts ?? {}).sort(([a], [b]) => a.localeCompare(b));
const lines = [];
lines.push('# Generated Command Reference');
lines.push('');
lines.push('Generated from `package.json`.');
lines.push('');
lines.push('| Command | Script |');
lines.push('|---|---|');
for (const [name, script] of scripts) {
  lines.push(`| \`pnpm ${name}\` | \`${script.replaceAll('|', '\\|')}\` |`);
}
lines.push('');
const out = path.join(root, 'docs/commands/command-reference.generated.md');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`Wrote ${path.relative(root, out)} with ${scripts.length} commands.`);
