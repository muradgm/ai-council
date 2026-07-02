#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const fail = [];
const warn = [];

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

function dirsWithMarker(rel, marker) {
  const parent = path.join(root, rel);
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(parent, entry.name, marker)))
    .map(entry => entry.name)
    .sort();
}

function requireFile(rel) {
  if (!exists(rel)) fail.push(`Missing required file: ${rel}`);
}

function requireDir(rel) {
  if (!exists(rel) || !fs.statSync(path.join(root, rel)).isDirectory()) fail.push(`Missing required directory: ${rel}`);
}

function runGate(name, command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell: false
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  if (result.error) {
    fail.push(`${name} failed to start: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    fail.push(`${name} failed with exit code ${result.status}${output ? `\n${output}` : ''}`);
    return;
  }
  console.log(`PASS ${name}`);
}

const requiredFiles = [
  'README.md',
  'VERSION',
  'AGENTS.md',
  'package.json',
  'pnpm-workspace.yaml',
  'packages/orchestrator/bootstrap.md',
  'docs/codex-master-startup.md',
  'docs/architecture/system-overview.md',
  'docs/architecture/package-map.md',
  'docs/commands/command-reference.md',
  'docs/onboarding/quick-start.md',
  'docs/release/v2.0.0-release-notes.md',
  'packages/release/release.json',
  'packages/release/RELEASE.md'
];

const requiredDirs = [
  'packages/skills',
  'packages/senior-agents',
  'packages/decision-engines',
  'packages/workflows',
  'packages/templates',
  'packages/memory',
  'packages/evals',
  'packages/ai-providers',
  'packages/tool-contracts',
  'packages/observability',
  'packages/project-packs',
  'packages/automation',
  'packages/governance',
  'packages/release',
  'apps/web-console',
  'apps/api-server',
  'storage/memory',
  'storage/observability',
  'storage/governance',
  'projects'
];

for (const file of requiredFiles) requireFile(file);
for (const dir of requiredDirs) requireDir(dir);

const counts = {
  skills: dirsWithMarker('packages/skills', 'SKILL.md').length,
  agents: dirsWithMarker('packages/senior-agents', 'AGENT.md').length,
  engines: dirsWithMarker('packages/decision-engines', 'ENGINE.md').length,
  workflows: dirsWithMarker('packages/workflows', 'WORKFLOW.md').length,
  templates: dirsWithMarker('packages/templates/deliverables', 'TEMPLATE.md').length,
  toolContracts: dirsWithMarker('packages/tool-contracts/contracts', 'TOOL.md').length,
  automationCapabilities: dirsWithMarker('packages/automation/capabilities', 'CAPABILITY.md').length,
  governanceCapabilities: dirsWithMarker('packages/governance/capabilities', 'CAPABILITY.md').length,
  projectPacks: dirsWithMarker('packages/project-packs', 'PROJECT_PACK.md').length
};

const minimums = {
  skills: 60,
  agents: 40,
  engines: 30,
  workflows: 25,
  templates: 30,
  toolContracts: 15,
  automationCapabilities: 8,
  governanceCapabilities: 10,
  projectPacks: 4
};

for (const [key, min] of Object.entries(minimums)) {
  if ((counts[key] ?? 0) < min) fail.push(`${key} count too low: ${counts[key]} < ${min}`);
}

if (exists('VERSION')) {
  const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
  if (version !== '2.0.0') fail.push(`VERSION should be 2.0.0 but is ${version}`);
}

if (exists('packages/release/release.json')) {
  const release = readJson('packages/release/release.json');
  if (release.version !== '2.0.0') fail.push('packages/release/release.json version must be 2.0.0');
  if (release.phase !== 16) fail.push('packages/release/release.json phase must be 16');
}

const pkg = exists('package.json') ? readJson('package.json') : { scripts: {} };
for (const script of ['validate:knowledge', 'final:validate', 'release:status', 'docs:commands', 'council']) {
  if (!pkg.scripts?.[script]) fail.push(`Missing package script: ${script}`);
}

const hardGates = [
  ['TypeScript build', process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json']],
  ['Smoke tests', process.execPath, [path.join(root, 'node_modules/tsx/dist/cli.mjs'), 'tests/smoke.test.ts']],
  ['Model-backed agent behavior', process.execPath, [path.join(root, 'node_modules/tsx/dist/cli.mjs'), 'tests/model-backed-agents.test.ts']],
  ['Knowledge validation', process.execPath, ['scripts/validate-knowledge.mjs']],
  ['Council doctor', process.execPath, ['scripts/council-doctor.mjs']],
  ['Runtime index', process.execPath, ['scripts/runtime-index.mjs']],
  ['Runtime context smoke', process.execPath, ['scripts/runtime-context.mjs', 'TradeFrame', 'final validation runtime smoke']],
  ['Runtime run smoke', process.execPath, ['scripts/runtime-run.mjs', 'TradeFrame', 'final validation runtime execution smoke']],
  ['Runtime artifact quality', process.execPath, ['scripts/runtime-eval.mjs']],
  ['Learning report', process.execPath, ['scripts/learning-report.mjs']],
  ['Eval suites', process.execPath, ['scripts/run-evals.mjs']],
  ['Quality gates', process.execPath, ['scripts/run-quality-gates.mjs']]
];

console.log('Hard gates');
console.log('----------');
for (const [name, command, args] of hardGates) {
  if (!fs.existsSync(command) && command !== process.execPath) {
    fail.push(`${name} missing executable: ${command}`);
    continue;
  }
  runGate(name, command, args);
}

const projectNames = ['tradeframe', 'signalscout', 'navo', 'swimly'];
for (const project of projectNames) {
  if (!exists(`packages/project-packs/${project}/PROJECT_PACK.md`)) warn.push(`Project pack not found for ${project}`);
}

console.log('AI Council v2.0.0 final validation');
console.log('-------------------------------------');
for (const [key, value] of Object.entries(counts)) console.log(`${key}: ${value}`);
console.log(`releasePackage: ${exists('packages/release/release.json') ? 'enabled' : 'missing'}`);
console.log(`webConsole: ${exists('apps/web-console') ? 'enabled' : 'missing'}`);
console.log(`governance: ${exists('packages/governance') ? 'enabled' : 'missing'}`);
console.log(`observability: ${exists('packages/observability') ? 'enabled' : 'missing'}`);

if (warn.length) {
  console.log('\nWarnings:');
  for (const item of warn) console.log(`- ${item}`);
}

if (fail.length) {
  console.error('\nFinal validation failed:');
  for (const item of fail) console.error(`- ${item}`);
  process.exit(1);
}

console.log('\nFinal validation passed. AI Council v2.0.0 architecture and knowledge foundation are complete; runtime is ready for MVP hardening.');
