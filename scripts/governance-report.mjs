#!/usr/bin/env node
import { listJson, nowId, writeJson } from './lib/governance-utils.mjs';

const report = {
  id: nowId('governance-report'),
  createdAt: new Date().toISOString(),
  counts: {
    approvals: listJson('storage/governance/approvals').length,
    auditRecords: listJson('storage/governance/audit').length,
    permissions: listJson('storage/governance/permissions').length,
    secretsScans: listJson('storage/governance/secrets-scans').length,
    promptInjectionReviews: listJson('storage/governance/prompt-injection-reviews').length,
    tradingFinanceReviews: listJson('storage/governance/trading-finance-reviews').length,
    incidents: listJson('storage/governance/incidents').length
  },
  recommendation: 'Run governance checks before high-impact automation, provider, deployment, external-send, or trading-related actions.'
};
writeJson(`storage/governance/reports/${report.id}.json`, report);
console.log(JSON.stringify(report, null, 2));
