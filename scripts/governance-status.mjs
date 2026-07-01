#!/usr/bin/env node
import { listJson, readJson } from './lib/governance-utils.mjs';

const index = readJson('packages/governance/governance.index.json', { capabilities: [] });
const counts = {
  capabilities: index.capabilities?.length || 0,
  approvals: listJson('storage/governance/approvals').length,
  auditRecords: listJson('storage/governance/audit').length,
  secretsScans: listJson('storage/governance/secrets-scans').length,
  promptInjectionReviews: listJson('storage/governance/prompt-injection-reviews').length,
  tradingFinanceReviews: listJson('storage/governance/trading-finance-reviews').length,
  reports: listJson('storage/governance/reports').length,
  incidents: listJson('storage/governance/incidents').length
};
for (const [key, value] of Object.entries(counts)) console.log(`${key}: ${value}`);
