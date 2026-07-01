#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const [project = 'general', task = 'unspecified task', summary = 'No summary provided', status = 'completed'] = process.argv.slice(2);
const timestamp = new Date().toISOString();
const id = `run-${timestamp.replace(/[:.]/g,'-')}-${crypto.randomBytes(3).toString('hex')}`;
const record = { id, timestamp, project, task, status, summary, agents: [], skills: [], engines: [], workflows: [], templates: [], artifacts: [], validations: [], risks: [], nextActions: [] };
const dir = path.join(root, 'storage', 'observability', 'runs');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf8');
console.log(`Recorded run trace: ${id}`);
console.log(path.relative(root, path.join(dir, `${id}.json`)));
