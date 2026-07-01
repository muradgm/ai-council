#!/usr/bin/env node
import { listJson } from './lib/governance-utils.mjs';

const records = listJson('storage/governance/approvals').map(r => r.data);
if (!records.length) {
  console.log('No approval requests found.');
  process.exit(0);
}
for (const r of records) {
  console.log(`${r.id} | ${r.status} | ${r.riskLevel} | ${r.project} | ${r.action}`);
}
