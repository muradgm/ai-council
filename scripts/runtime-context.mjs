#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { projectCandidates, readText, routeRequest, root, toSlug, writeJson, writeText, nowIso } from './lib/council-utils.mjs';

const [project = 'general', ...taskParts] = process.argv.slice(2);
const task = taskParts.join(' ').trim() || 'Prepare runtime context.';

function ensureIndex() {
  const rel = 'storage/runtime/repo-index.json';
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    throw new Error('Missing runtime index. Run `pnpm runtime:index` first.');
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function firstExisting(paths) {
  return paths.find(rel => rel && fs.existsSync(path.join(root, rel))) || null;
}

function topRel(items, fallback = []) {
  return [...items.map(item => item.rel), ...fallback].filter(Boolean);
}

function byId(items, id) {
  return items.find(item => item.id === id || item.name === id) || null;
}

function uniqueItems(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function projectAssetItems(index, type, ids = []) {
  const collection = index.collections[type] || [];
  return ids.map(id => byId(collection, id)).filter(Boolean);
}

function preferredWorkflow(task, projectRecord) {
  const text = task.toLowerCase();
  const workflows = projectRecord?.workflows || [];
  if (/architecture|system design|technical design|database|backend/.test(text) && workflows.includes('architecture-review')) return 'architecture-review';
  if (/release|ship|launch|deploy/.test(text) && workflows.includes('release-readiness')) return 'release-readiness';
  if (/build|implement|code/.test(text) && workflows.includes('build-execution')) return 'build-execution';
  if (/trading|trade|journal|risk|backtest/.test(text) && workflows.includes('trading-system-review')) return 'trading-system-review';
  return workflows[0] || null;
}

function preferredEngine(task, projectRecord) {
  const text = task.toLowerCase();
  const engines = projectRecord?.decisionEngines || [];
  if (/architecture|system design|technical design|database|backend/.test(text) && engines.includes('architecture-engine')) return 'architecture-engine';
  if (/risk|drawdown|trading|trade|forex/.test(text) && engines.includes('trading-risk-engine')) return 'trading-risk-engine';
  if (/product|mvp|feature|workflow/.test(text) && engines.includes('product-strategy-engine')) return 'product-strategy-engine';
  return engines[0] || null;
}

const index = ensureIndex();
const routes = routeRequest(`${project} ${task}`, 5);
const candidates = projectCandidates(project);
const projectRel = candidates.find(item => item.type === 'project')?.rel || null;
const memoryRel = candidates.find(item => item.type === 'memory')?.rel || null;
const projectKey = String(project).toLowerCase();
const projectRecord = (index.collections.projects || []).find(item => String(item.id).toLowerCase() === projectKey || String(item.title || '').toLowerCase() === projectKey);

const selected = {
  project,
  task,
  projectRel: projectRel || projectRecord?.projectRel || null,
  memoryRel: memoryRel || projectRecord?.memoryRel || null,
  projectPackRel: projectRecord?.projectPackRel || null,
  agents: uniqueItems([
    ...projectAssetItems(index, 'agents', projectRecord?.agents || []),
    ...routes.agents
  ]).slice(0, 6),
  skills: uniqueItems([
    ...projectAssetItems(index, 'skills', projectRecord?.skills || []),
    ...routes.skills
  ]).slice(0, 8),
  engines: uniqueItems([
    ...projectAssetItems(index, 'engines', [preferredEngine(task, projectRecord)].filter(Boolean)),
    ...projectAssetItems(index, 'engines', projectRecord?.decisionEngines || []),
    ...routes.engines
  ]).slice(0, 6),
  workflows: uniqueItems([
    ...projectAssetItems(index, 'workflows', [preferredWorkflow(task, projectRecord)].filter(Boolean)),
    ...projectAssetItems(index, 'workflows', projectRecord?.workflows || []),
    ...routes.workflows
  ]).slice(0, 6),
  templates: routes.templates
};

const readSet = [
  'AGENTS.md',
  'packages/orchestrator/bootstrap.md',
  firstExisting([selected.projectRel && `${selected.projectRel}/PROJECT.md`, selected.projectRel && `${selected.projectRel}/README.md`]),
  selected.memoryRel && `${selected.memoryRel}/project-context.md`,
  selected.projectPackRel && `${selected.projectPackRel}/PROJECT_PACK.md`,
  ...topRel(selected.workflows).slice(0, 2).map(rel => `${rel}/WORKFLOW.md`),
  ...topRel(selected.engines).slice(0, 2).map(rel => `${rel}/ENGINE.md`),
  ...topRel(selected.agents).slice(0, 3).map(rel => `${rel}/AGENT.md`),
  ...topRel(selected.skills).slice(0, 3).map(rel => `${rel}/SKILL.md`)
].filter(Boolean);

const existingReadSet = Array.from(new Set(readSet)).filter(rel => fs.existsSync(path.join(root, rel)));
const cacheKey = crypto.createHash('sha256').update(JSON.stringify({ project, task, readSet: existingReadSet })).digest('hex').slice(0, 16);
const generatedAt = nowIso();

const context = {
  cacheKey,
  generatedAt,
  project,
  task,
  selected,
  readSet: existingReadSet,
  recommendedWorkflow: selected.workflows[0]?.id || projectRecord?.workflows?.[0] || null,
  recommendedEngine: selected.engines[0]?.id || projectRecord?.decisionEngines?.[0] || null,
  recommendedAgents: selected.agents.map(item => item.id),
  recommendedSkills: selected.skills.map(item => item.id),
  validation: [
    'pnpm build',
    'pnpm test',
    'pnpm validate:knowledge',
    'pnpm final:validate'
  ]
};

const slug = toSlug(project);
writeJson(`storage/runtime/cache/${slug}.runtime-context.json`, context);
writeJson('storage/runtime/cache/latest-runtime-context.json', context);

const sections = existingReadSet.map(rel => {
  const text = readText(rel).slice(0, 3000);
  return `### ${rel}\n\n${text}`;
}).join('\n\n');

const md = `# Runtime Context Pack\n\nGenerated: ${generatedAt}\n\nCache key: \`${cacheKey}\`\n\n## Project\n\n${project}\n\n## Task\n\n${task}\n\n## Selected Runtime Assets\n\n- Workflow: ${context.recommendedWorkflow || 'No strong match'}\n- Engine: ${context.recommendedEngine || 'No strong match'}\n- Agents: ${context.recommendedAgents.join(', ') || 'No strong match'}\n- Skills: ${context.recommendedSkills.join(', ') || 'No strong match'}\n\n## Read Set\n\n${existingReadSet.map(rel => `- ${rel}`).join('\n') || '- None'}\n\n## Validation\n\n${context.validation.map(command => `- \`${command}\``).join('\n')}\n\n## Loaded Context\n\n${sections}\n`;

writeText(`storage/runtime/cache/${slug}.runtime-context.md`, md);
writeText('storage/runtime/cache/latest-runtime-context.md', md);

console.log(`Runtime context generated: storage/runtime/cache/${slug}.runtime-context.md`);
console.log(`Cache key: ${cacheKey}`);
