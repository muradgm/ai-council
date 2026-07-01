#!/usr/bin/env node
import { counts, exists } from './lib/council-utils.mjs';

const required = [
  'AGENTS.md',
  'packages/orchestrator/bootstrap.md',
  'packages/skills',
  'packages/senior-agents',
  'packages/decision-engines',
  'packages/workflows',
  'packages/templates',
  'packages/memory',
  'packages/tool-contracts',
  'packages/observability',
  'storage/observability',
  'docs/codex-one-command-setup.md',
  'docs/cli-reference.md',
  'scripts/council.mjs'
];

const missing = required.filter(rel => !exists(rel));
const summary = {
  status: missing.length === 0 ? 'healthy' : 'needs_attention',
  counts: counts(),
  missing
};

console.log('AI Council health');
console.log('-----------------');
for (const [key, value] of Object.entries(summary.counts)) console.log(`${key}: ${value}`);
console.log(`status: ${summary.status}`);
if (missing.length) {
  console.log('\nMissing:');
  for (const rel of missing) console.log(`- ${rel}`);
}
console.log('\nJSON:');
console.log(JSON.stringify(summary, null, 2));
