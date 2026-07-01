#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function nowSlug() { return new Date().toISOString().replace(/[:.]/g, '-'); }
function listDirs(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort();
}
function dirsWithMarker(rel, marker) { return listDirs(rel).filter(name => fs.existsSync(path.join(root, rel, name, marker))); }
function readJson(rel, fallback = null) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return fallback;
  try { return JSON.parse(fs.readFileSync(full, 'utf8')); } catch { return fallback; }
}
const snapshot = {
  generatedAt: new Date().toISOString(),
  phase: readJson('apps/web-console/console.config.json', {}).phase || null,
  counts: {
    skills: dirsWithMarker('packages/skills', 'SKILL.md').length,
    agents: dirsWithMarker('packages/senior-agents', 'AGENT.md').length,
    engines: dirsWithMarker('packages/decision-engines', 'ENGINE.md').length,
    workflows: dirsWithMarker('packages/workflows', 'WORKFLOW.md').length,
    templates: dirsWithMarker('packages/templates/deliverables', 'TEMPLATE.md').length,
    evalSuites: dirsWithMarker('packages/evals/suites', 'SUITE.md').length,
    providers: (readJson('packages/ai-providers/providers.index.json', { providers: [] }).providers || []).length,
    toolContracts: dirsWithMarker('packages/tool-contracts/contracts', 'TOOL.md').length,
    projects: listDirs('projects').length
  },
  panels: readJson('apps/web-console/console.config.json', {}).panels || [],
  runCommands: ['pnpm dev:api', 'pnpm dev:web', 'pnpm console:status', 'pnpm apps:setup', 'pnpm runtime:run', 'pnpm runtime:eval']
};
const out = path.join(root, 'storage', 'web-console', 'snapshots', `${nowSlug()}.json`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(snapshot, null, 2));
console.log(`Console snapshot written: ${path.relative(root, out)}`);
