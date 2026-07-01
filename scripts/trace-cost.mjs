#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const [category = 'provider', amount = '0', currency = 'EUR', summary = 'No summary provided', provider = 'unknown'] = process.argv.slice(2);
const timestamp = new Date().toISOString();
const id = `cost-${timestamp.replace(/[:.]/g,'-')}-${crypto.randomBytes(3).toString('hex')}`;
const record = { id, timestamp, category, provider, amount: Number(amount) || 0, currency, summary };
const dir = path.join(root, 'storage', 'observability', 'costs');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf8');
console.log(`Recorded cost: ${id}`);
