#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function listDirs(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort();
}
function dirsWithMarker(rel, marker) { return listDirs(rel).filter(name => exists(`${rel}/${name}/${marker}`)); }
function readJson(rel, fallback = null) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return fallback;
  try { return JSON.parse(fs.readFileSync(full, 'utf8')); } catch { return fallback; }
}
const config = readJson('apps/web-console/console.config.json', {});
const status = {
  webConsole: exists('apps/web-console/index.html'),
  apiServer: exists('apps/api-server/src/main.ts'),
  config: exists('apps/web-console/console.config.json'),
  docs: exists('docs/web-console-system.md'),
  phase: config.phase || null,
  panels: config.panels || [],
  counts: {
    skills: dirsWithMarker('packages/skills', 'SKILL.md').length,
    agents: dirsWithMarker('packages/senior-agents', 'AGENT.md').length,
    engines: dirsWithMarker('packages/decision-engines', 'ENGINE.md').length,
    workflows: dirsWithMarker('packages/workflows', 'WORKFLOW.md').length,
    templates: dirsWithMarker('packages/templates/deliverables', 'TEMPLATE.md').length,
    evalSuites: dirsWithMarker('packages/evals/suites', 'SUITE.md').length,
    projects: listDirs('projects').length
  },
  commands: {
    api: 'pnpm dev:api',
    web: 'pnpm dev:web',
    status: 'pnpm console:status',
    snapshot: 'pnpm console:snapshot',
    appsSetup: 'pnpm apps:setup',
    runtimeRun: 'pnpm runtime:run',
    runtimeEval: 'pnpm runtime:eval'
  }
};
console.log(JSON.stringify(status, null, 2));
