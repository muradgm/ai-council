#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const file = path.join(process.cwd(), 'docs/release/v2.0.0-release-notes.md');
if (!fs.existsSync(file)) {
  console.error('Release notes not found.');
  process.exit(1);
}
console.log(fs.readFileSync(file, 'utf8'));
