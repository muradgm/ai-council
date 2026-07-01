#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { root, readJson } from './lib/governance-utils.mjs';

const required = [
  'packages/governance/GOVERNANCE.md',
  'packages/governance/governance.index.json',
  'packages/governance/policies/permission-model.md',
  'packages/governance/policies/approval-gates.md',
  'packages/governance/policies/secrets-policy.md',
  'packages/governance/policies/prompt-injection-defense.md',
  'packages/governance/policies/trading-finance-governance.md',
  'storage/governance/audit',
  'storage/governance/approvals'
];
let failed = false;
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`Missing: ${rel}`);
    failed = true;
  }
}
const index = readJson('packages/governance/governance.index.json', { capabilities: [] });
if (!Array.isArray(index.capabilities) || index.capabilities.length < 10) {
  console.error('Governance index has too few capabilities.');
  failed = true;
}
if (failed) process.exit(1);
console.log(`Governance doctor passed. Capabilities: ${index.capabilities.length}`);
