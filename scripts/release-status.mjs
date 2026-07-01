#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
function dirsWithMarker(rel, marker) {
  const parent = path.join(root, rel);
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(parent, entry.name, marker)))
    .map(entry => entry.name);
}

const release = exists('packages/release/release.json') ? readJson('packages/release/release.json') : {};
const counts = {
  skills: dirsWithMarker('packages/skills', 'SKILL.md').length,
  seniorAgents: dirsWithMarker('packages/senior-agents', 'AGENT.md').length,
  decisionEngines: dirsWithMarker('packages/decision-engines', 'ENGINE.md').length,
  workflows: dirsWithMarker('packages/workflows', 'WORKFLOW.md').length,
  templates: dirsWithMarker('packages/templates/deliverables', 'TEMPLATE.md').length,
  projectPacks: dirsWithMarker('packages/project-packs', 'PROJECT_PACK.md').length,
  governanceCapabilities: dirsWithMarker('packages/governance/capabilities', 'CAPABILITY.md').length,
  automationCapabilities: dirsWithMarker('packages/automation/capabilities', 'CAPABILITY.md').length
};

console.log(`AI Council ${release.version ?? 'unknown'}`);
console.log(`Codename: ${release.codename ?? 'unknown'}`);
console.log(`Phase: ${release.phase ?? 'unknown'}`);
console.log(`Status: ${release.status ?? 'unknown'}`);
console.log('');
for (const [key, value] of Object.entries(counts)) console.log(`${key}: ${value}`);
console.log('');
console.log(release.recommendedNextAction ?? 'Use the Council on real project work.');
