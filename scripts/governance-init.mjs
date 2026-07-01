#!/usr/bin/env node
import { ensureDir } from './lib/governance-utils.mjs';

const dirs = [
  'storage/governance/audit',
  'storage/governance/approvals',
  'storage/governance/security-reviews',
  'storage/governance/secrets-scans',
  'storage/governance/prompt-injection-reviews',
  'storage/governance/trading-finance-reviews',
  'storage/governance/reports',
  'storage/governance/incidents',
  'storage/governance/permissions'
];
for (const dir of dirs) ensureDir(dir);
console.log('Governance storage initialized.');
