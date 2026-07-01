#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const [artifactPath = 'unknown', artifactType = 'document', summary = 'No summary provided', source = 'manual'] = process.argv.slice(2);
const timestamp = new Date().toISOString();
const id = `artifact-${timestamp.replace(/[:.]/g,'-')}-${crypto.randomBytes(3).toString('hex')}`;
let hash = '';
const fullArtifact = path.join(root, artifactPath);
if (fs.existsSync(fullArtifact) && fs.statSync(fullArtifact).isFile()) {
  hash = crypto.createHash('sha256').update(fs.readFileSync(fullArtifact)).digest('hex');
}
const record = { id, timestamp, artifactPath, artifactType, summary, source, hash };
const dir = path.join(root, 'storage', 'observability', 'artifacts');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2) + '\n', 'utf8');
console.log(`Recorded artifact: ${id}`);
