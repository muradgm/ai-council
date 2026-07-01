#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const timestamp = new Date().toISOString();
const id = `diagnostic-${timestamp.replace(/[:.]/g,'-')}-${crypto.randomBytes(3).toString('hex')}`;
const checks = [
  'AGENTS.md',
  'packages/orchestrator/bootstrap.md',
  'packages/skills',
  'packages/senior-agents',
  'packages/decision-engines',
  'packages/workflows',
  'packages/templates',
  'packages/memory',
  'packages/evals',
  'packages/ai-providers',
  'packages/tool-contracts',
  'packages/observability',
  'storage/observability'
].map(rel => ({ rel, exists: fs.existsSync(path.join(root, rel)) }));
const missing = checks.filter(c => !c.exists).map(c => c.rel);
const record = { id, timestamp, status: missing.length ? 'needs_attention' : 'healthy', summary: missing.length ? `Missing ${missing.length} required paths.` : 'Repository diagnostics passed basic path checks.', checks, recommendations: missing.map(rel => `Create or restore ${rel}`) };
const dir = path.join(root, 'storage', 'observability', 'diagnostics');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf8');
console.log(`Diagnostic report: ${record.status}`);
console.log(path.relative(root, path.join(dir, `${id}.json`)));
