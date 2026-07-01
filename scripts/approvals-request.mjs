#!/usr/bin/env node
import { classifyRisk, nowId, writeJson } from './lib/governance-utils.mjs';

const [project = 'General', action = 'Unspecified action', requestedRisk] = process.argv.slice(2);
const riskLevel = requestedRisk || classifyRisk(action);
const record = {
  id: nowId('approval'),
  createdAt: new Date().toISOString(),
  project,
  action,
  riskLevel,
  status: 'pending',
  approvalRequired: true,
  requiredEvidence: ['scope', 'risk summary', 'affected files/services', 'rollback plan'],
  approvalWording: `Approve this exact ${riskLevel}-risk action for ${project}: ${action}`
};
writeJson(`storage/governance/approvals/${record.id}.json`, record);
console.log(JSON.stringify(record, null, 2));
