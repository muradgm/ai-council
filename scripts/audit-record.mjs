#!/usr/bin/env node
import { classifyRisk, nowId, writeJson } from './lib/governance-utils.mjs';

const [kind = 'general', ...rest] = process.argv.slice(2);
const summary = rest.join(' ') || 'Governance audit record';
const record = {
  id: nowId('audit'),
  createdAt: new Date().toISOString(),
  kind,
  summary,
  riskLevel: classifyRisk(summary),
  source: 'manual-script'
};
writeJson(`storage/governance/audit/${record.id}.json`, record);
console.log(JSON.stringify(record, null, 2));
