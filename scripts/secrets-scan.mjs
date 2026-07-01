#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { detectSecretPatterns, nowId, root, writeJson } from './lib/governance-utils.mjs';

const target = process.argv[2] || '.';
const base = path.resolve(root, target);
const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.next']);
const ignoredRelPrefixes = [
  'storage/runtime',
  'storage/evals',
  'storage/observability',
  'storage/governance/secrets-scans',
  'storage/web-console'
];
const allowedExt = new Set(['.md', '.txt', '.json', '.js', '.mjs', '.ts', '.tsx', '.env', '.example', '.yml', '.yaml']);
const findings = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll(path.sep, '/');
    if (ignoredRelPrefixes.some(prefix => rel === prefix || rel.startsWith(`${prefix}/`))) continue;
    if (entry.isDirectory()) walk(full);
    else {
      const ext = path.extname(entry.name);
      if (!allowedExt.has(ext) && !entry.name.includes('.env')) continue;
      if (fs.statSync(full).size > 512_000) continue;
      const text = fs.readFileSync(full, 'utf8');
      const hit = detectSecretPatterns(text);
      if (hit.length) findings.push({ file: path.relative(root, full), findings: hit });
    }
  }
}
walk(base);
const report = { id: nowId('secrets-scan'), createdAt: new Date().toISOString(), target: path.relative(root, base) || '.', findings, decision: findings.length ? 'review_required' : 'clear' };
writeJson(`storage/governance/secrets-scans/${report.id}.json`, report);
console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exitCode = 1;
