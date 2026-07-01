#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', 'dist']);
const ignoredPrefixes = [
  'storage/runtime',
  'storage/evals',
  'storage/observability',
  'storage/governance/secrets-scans',
  'storage/web-console'
];
const checkedExtensions = new Set([
  '.md',
  '.json',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.yml',
  '.yaml',
  '.example'
]);
const checkedRoots = [
  'apps',
  'scripts',
  'tests',
  'packages/ai-core',
  'packages/ai-providers',
  'packages/orchestrator/src',
  'packages/shared',
  'package.json',
  'tsconfig.json',
  'docker-compose.yml',
  '.env.example',
  '.gitignore',
  'AGENTS.md',
  'README.md'
];

const failures = [];

function shouldSkip(rel) {
  return ignoredPrefixes.some(prefix => rel === prefix || rel.startsWith(`${prefix}/`));
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, '/');
    if (shouldSkip(rel)) continue;
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!checkedExtensions.has(ext) && entry.name !== '.gitignore') continue;
    if (fs.statSync(full).size > 512_000) continue;

    const text = fs.readFileSync(full, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (/[ \t]$/.test(line)) failures.push(`${rel}:${index + 1} trailing whitespace`);
    });
    if (text.length && !text.endsWith('\n')) failures.push(`${rel}: missing final newline`);
  }
}

for (const rel of checkedRoots) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const normalized = rel.replaceAll(path.sep, '/');
  if (shouldSkip(normalized)) continue;
  if (fs.statSync(full).isDirectory()) walk(full);
  else {
    const name = path.basename(full);
    const ext = path.extname(name);
    if (!checkedExtensions.has(ext) && name !== '.gitignore') continue;
    const text = fs.readFileSync(full, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (/[ \t]$/.test(line)) failures.push(`${rel}:${index + 1} trailing whitespace`);
    });
    if (text.length && !text.endsWith('\n')) failures.push(`${rel}: missing final newline`);
  }
}

if (failures.length) {
  console.error('Format check failed:');
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  if (failures.length > 100) console.error(`- ...and ${failures.length - 100} more`);
  process.exit(1);
}

console.log('Format check passed.');
