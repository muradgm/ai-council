#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const [provider = 'unknown-provider', purpose = 'unspecified purpose', tier = 'unknown', estimatedCost = '0', model = 'unknown-model'] = process.argv.slice(2);
const timestamp = new Date().toISOString();
const id = `provider-${timestamp.replace(/[:.]/g,'-')}-${crypto.randomBytes(3).toString('hex')}`;
const record = { id, timestamp, provider, model, purpose, tier, estimatedCost: Number(estimatedCost) || 0, redaction: 'summary-only', status: 'recorded' };
const dir = path.join(root, 'storage', 'observability', 'provider-calls');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf8');
console.log(`Recorded provider call trace: ${id}`);
