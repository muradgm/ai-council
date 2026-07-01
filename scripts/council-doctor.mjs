#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { counts, exists, root, readJson } from './lib/council-utils.mjs';

let failed = false;
const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  if (!ok) failed = true;
}

const c = counts();
check('Root AGENTS.md exists', exists('AGENTS.md'));
check('Orchestrator bootstrap exists', exists('packages/orchestrator/bootstrap.md'));
check('Skills layer present', c.skills >= 60, `${c.skills} skills`);
check('Senior agents layer present', c.agents >= 40, `${c.agents} agents`);
check('Decision engines layer present', c.engines >= 30, `${c.engines} engines`);
check('Workflows layer present', c.workflows >= 30, `${c.workflows} workflows`);
check('Templates layer present', c.templates >= 35, `${c.templates} templates`);
check('Memory layer present', exists('packages/memory/MEMORY.md'));
check('CLI package present', exists('packages/cli/CLI.md'));
check('CLI executable script present', exists('scripts/council.mjs'));
check('Codex setup doc present', exists('docs/codex-one-command-setup.md'));

const pkg = readJson('package.json', {});
const scripts = pkg.scripts || {};
for (const script of ['council', 'council:doctor', 'council:route', 'codex:context', 'project:init', 'repo:map']) {
  check(`package script ${script}`, Boolean(scripts[script]), scripts[script] || 'missing');
}

const validate = spawnSync(process.execPath, [path.join(root, 'scripts/validate-knowledge.mjs')], { cwd: root, encoding: 'utf8' });
check('Knowledge validation script passes', validate.status === 0, validate.status === 0 ? validate.stdout.trim() : validate.stderr.trim());

console.log('AI Council doctor');
console.log('-----------------');
for (const item of checks) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
}

if (failed) process.exit(1);
console.log('\nRepository diagnostics passed.');
