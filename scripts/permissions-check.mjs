#!/usr/bin/env node
import { classifyRisk, permissionDecision, writeJson, nowId } from './lib/governance-utils.mjs';

const request = process.argv.slice(2).join(' ') || 'No request provided';
const riskLevel = classifyRisk(request);
const decision = permissionDecision(request);
const record = {
  id: nowId('permission'),
  createdAt: new Date().toISOString(),
  action: request,
  riskLevel,
  ...decision,
  safeNextStep: decision.approvalRequired ? 'Create an approval request before execution.' : 'Proceed within stated scope and log if material.'
};
writeJson(`storage/governance/permissions/${record.id}.json`, record);
console.log(JSON.stringify(record, null, 2));
