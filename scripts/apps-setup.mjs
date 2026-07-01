#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { nowIso, root, writeJson, writeText } from './lib/council-utils.mjs';

function commandExists(command) {
  const shellCommand = process.platform === 'win32'
    ? ['where.exe', [command]]
    : ['command', ['-v', command]];
  const result = spawnSync(shellCommand[0], shellCommand[1], { encoding: 'utf8', shell: process.platform !== 'win32' });
  return {
    ok: result.status === 0,
    path: (result.stdout || '').split(/\r?\n/).find(Boolean) || null
  };
}

async function httpCheck(name, url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return { name, url, ok: response.ok, status: response.status };
  } catch (error) {
    return { name, url, ok: false, status: null, error: error instanceof Error ? error.message : String(error) };
  }
}

function envState(name) {
  return { name, configured: Boolean(process.env[name]) };
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function runScript(script) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script)], {
    cwd: root,
    encoding: 'utf8',
    shell: false
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || ''
  };
}

const requiredLocalCommands = ['node', 'pnpm'];
const optionalModelApps = ['ollama', 'lmstudio'];
const providerEnv = [
  'OLLAMA_BASE_URL',
  'OLLAMA_MODEL',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
  'DEEPSEEK_API_KEY',
  'XAI_API_KEY',
  'MISTRAL_API_KEY',
  'OPENROUTER_API_KEY',
  'TOGETHER_API_KEY'
];

const checks = {
  generatedAt: nowIso(),
  localApps: {
    webConsole: exists('apps/web-console/index.html'),
    apiServer: exists('apps/api-server/src/main.ts'),
    cli: exists('apps/cli/src/index.ts')
  },
  commands: Object.fromEntries([...requiredLocalCommands, ...optionalModelApps].map(command => [command, commandExists(command)])),
  endpoints: [
    await httpCheck('api', 'http://localhost:3333/health'),
    await httpCheck('web', 'http://localhost:5173'),
    await httpCheck('runtime', 'http://localhost:3333/api/runtime/latest')
  ],
  providerEnv: providerEnv.map(envState),
  consoleStatus: runScript('console-status.mjs'),
  providerHealth: runScript('provider-health.mjs')
};

const missingRequired = requiredLocalCommands.filter(command => !checks.commands[command].ok);
const missingModelApps = optionalModelApps.filter(command => !checks.commands[command].ok);
const downEndpoints = checks.endpoints.filter(endpoint => !endpoint.ok);
const configuredProviders = checks.providerEnv.filter(item => item.configured).map(item => item.name);

const recommendations = [];
if (missingRequired.length) recommendations.push(`Install required local command(s): ${missingRequired.join(', ')}.`);
if (downEndpoints.length) recommendations.push('Start local services with `pnpm dev:api` and `pnpm dev:web`.');
if (missingModelApps.includes('ollama')) recommendations.push('Install Ollama and run a local model for model-backed chat/runtime synthesis.');
if (configuredProviders.length === 0) recommendations.push('Set provider environment variables only for providers you intend to use.');
if (!recommendations.length) recommendations.push('Local apps are installed, connected, and ready.');

const report = {
  ...checks,
  ready: missingRequired.length === 0 && downEndpoints.length === 0,
  missingRequired,
  missingModelApps,
  configuredProviders,
  recommendations
};

writeJson('storage/runtime/apps-connection-report.json', report);

const commandLines = Object.entries(report.commands)
  .map(([name, check]) => `- ${check.ok ? 'OK' : 'MISS'} ${name}${check.path ? `: ${check.path}` : ''}`)
  .join('\n');
const endpointLines = report.endpoints
  .map(endpoint => `- ${endpoint.ok ? 'OK' : 'DOWN'} ${endpoint.name}: ${endpoint.url}${endpoint.status ? ` (${endpoint.status})` : ''}`)
  .join('\n');
const envLines = report.providerEnv
  .map(item => `- ${item.configured ? 'SET' : 'MISS'} ${item.name}`)
  .join('\n');
const recommendationLines = recommendations.map(item => `- ${item}`).join('\n');

writeText('storage/runtime/apps-connection-report.md', `# Apps Connection Report

Generated: ${report.generatedAt}

## Status

- Ready: ${report.ready}

## Commands

${commandLines}

## Endpoints

${endpointLines}

## Provider Environment

${envLines}

## Recommendations

${recommendationLines}
`);

console.log(`Apps ready: ${report.ready}`);
console.log('Saved: storage/runtime/apps-connection-report.md');
for (const item of recommendations) console.log(`- ${item}`);

if (missingRequired.length || downEndpoints.length) process.exit(1);
