#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { root, dirsWithMarker, writeJson, writeText, nowIso } from './lib/council-utils.mjs';

const checks = [];
function check(name, passed, detail, severity = 'medium') {
  checks.push({ name, passed: Boolean(passed), detail, severity });
}
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function jsonOk(rel) {
  try { JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); return true; }
  catch { return false; }
}

const counts = {
  skills: dirsWithMarker('packages/skills','SKILL.md').length,
  agents: dirsWithMarker('packages/senior-agents','AGENT.md').length,
  engines: dirsWithMarker('packages/decision-engines','ENGINE.md').length,
  workflows: dirsWithMarker('packages/workflows','WORKFLOW.md').length,
  templates: dirsWithMarker('packages/templates/deliverables','TEMPLATE.md').length,
  evalSuites: dirsWithMarker('packages/evals/suites','SUITE.md').length,
  qualityGates: dirsWithMarker('packages/evals/quality-gates','GATE.md').length
};

check('minimum skill count', counts.skills >= 60, `skills=${counts.skills}`);
check('minimum agent count', counts.agents >= 40, `agents=${counts.agents}`);
check('minimum engine count', counts.engines >= 30, `engines=${counts.engines}`);
check('minimum workflow count', counts.workflows >= 30, `workflows=${counts.workflows}`);
check('minimum template count', counts.templates >= 35, `templates=${counts.templates}`);
check('minimum eval suite count', counts.evalSuites >= 10, `evalSuites=${counts.evalSuites}`);
check('minimum quality gate count', counts.qualityGates >= 6, `qualityGates=${counts.qualityGates}`);

for (const rel of [
  'packages/evals/evals.index.json',
  'packages/evals/eval.schema.json',
  'packages/skills/skills.index.json',
  'packages/senior-agents/agents.index.json',
  'packages/decision-engines/index.json',
  'packages/workflows/workflows.index.json',
  'packages/templates/templates.index.json'
]) check(`valid json: ${rel}`, exists(rel) && jsonOk(rel), rel, 'high');

for (const rel of [
  'docs/evals-quality-gates-system.md',
  'docs/codex-evals-guide.md',
  'docs/quality-gates.md',
  'docs/specs/eval-spec.md',
  'packages/evals/rubrics/trading-risk-rubric.md',
  'packages/evals/rubrics/domain-safety-rubric.md'
]) check(`required doc: ${rel}`, exists(rel), rel);

const tradingRubric = exists('packages/evals/rubrics/trading-risk-rubric.md') ? fs.readFileSync(path.join(root,'packages/evals/rubrics/trading-risk-rubric.md'),'utf8').toLowerCase() : '';
check('trading rubric rejects profit guarantees', tradingRubric.includes('avoid profit guarantees') || tradingRubric.includes('no guarantees'), 'trading-risk-rubric.md', 'high');
check('trading rubric requires risk sizing', tradingRubric.includes('risk sizing'), 'trading-risk-rubric.md', 'high');
check('security review workflow exists', exists('packages/workflows/security-review/WORKFLOW.md'), 'packages/workflows/security-review', 'high');
check('codex setup docs exist', exists('docs/codex-one-command-setup.md') && exists('docs/codex-evals-guide.md'), 'Codex docs');

const failed = checks.filter(c => !c.passed);
const report = { generatedAt: nowIso(), counts, passed: checks.length - failed.length, failed: failed.length, checks };
writeJson('storage/evals/latest-quality-gate-report.json', report);
const countLines = Object.entries(counts).map(([k,v]) => `- ${k}: ${v}`).join('\n');
const failedLines = failed.length ? failed.map(c => `- ${c.name}: ${c.detail} (${c.severity})`).join('\n') : 'No failed checks.';
const allLines = checks.map(c => `- ${c.passed ? 'PASS' : 'FAIL'} — ${c.name}: ${c.detail}`).join('\n');
const md = `# AI Council Quality Gate Report\n\nGenerated: ${report.generatedAt}\n\n## Summary\n\n- Checks: ${checks.length}\n- Passed: ${report.passed}\n- Failed: ${report.failed}\n\n## Counts\n\n${countLines}\n\n## Failed Checks\n\n${failedLines}\n\n## All Checks\n\n${allLines}\n`;
writeText('storage/evals/latest-quality-gate-report.md', md);
console.log(`Quality gates: ${checks.length}`);
console.log(`Passed: ${report.passed}`);
console.log(`Failed: ${report.failed}`);
console.log('Saved: storage/evals/latest-quality-gate-report.md');
if (failed.length) process.exit(1);
