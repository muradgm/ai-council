#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { allCollections, listDirs, readJson, root, writeJson, writeText, nowIso } from './lib/council-utils.mjs';

function loadCollection(rel, marker, manifest) {
  const parent = path.join(root, rel);
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(parent, entry.name, marker)))
    .map(entry => {
      const manifestRel = `${rel}/${entry.name}/${manifest}`;
      const data = readJson(manifestRel, { name: entry.name });
      return { id: entry.name, rel: `${rel}/${entry.name}`, ...data };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function projectRecords() {
  const projectDirs = listDirs('projects');
  const memoryDirs = listDirs('storage/memory/projects');
  const packIndex = readJson('packages/project-packs/project-packs.index.json', { packs: [] });
  const packs = new Map((packIndex.packs || []).map(pack => [String(pack.name).toLowerCase(), pack]));
  const names = Array.from(new Set([...projectDirs, ...memoryDirs, ...packs.keys()])).sort();

  return names.map(name => {
    const key = String(name).toLowerCase();
    const pack = packs.get(key);
    const projectRel = projectDirs.includes(name) ? `projects/${name}` : (pack?.projectRoot || null);
    const memoryName = memoryDirs.find(dir => dir.toLowerCase() === key);
    return {
      id: name,
      title: pack?.title || name,
      projectRel,
      memoryRel: memoryName ? `storage/memory/projects/${memoryName}` : pack?.memoryRoot || null,
      projectPackRel: pack ? `packages/project-packs/${pack.name}` : null,
      stage: pack?.stage || null,
      wedge: pack?.wedge || null,
      agents: pack?.agents || [],
      skills: pack?.skills || [],
      decisionEngines: pack?.decisionEngines || [],
      workflows: pack?.workflows || []
    };
  });
}

const collections = allCollections();
const providers = readJson('packages/ai-providers/providers.index.json', { providers: [] }).providers || [];
const toolContracts = loadCollection('packages/tool-contracts/contracts', 'TOOL.md', 'tool.json');
const governanceCapabilities = loadCollection('packages/governance/capabilities', 'CAPABILITY.md', 'capability.json');
const projects = projectRecords();

const relationships = {
  workflowToAgents: Object.fromEntries(collections.workflows.map(item => [item.id, item.agents || []])),
  workflowToSkills: Object.fromEntries(collections.workflows.map(item => [item.id, item.skills || []])),
  workflowToEngines: Object.fromEntries(collections.workflows.map(item => [item.id, item.decisionEngines || []])),
  engineToSkills: Object.fromEntries(collections.engines.map(item => [item.id, item.skills || []])),
  engineToOwners: Object.fromEntries(collections.engines.map(item => [item.id, item.ownerAgents || []])),
  agentToSkills: Object.fromEntries(collections.agents.map(item => [item.id, item.skills || []])),
  projectToRuntimeAssets: Object.fromEntries(projects.map(project => [project.id, {
    agents: project.agents,
    skills: project.skills,
    decisionEngines: project.decisionEngines,
    workflows: project.workflows
  }]))
};

const index = {
  generatedAt: nowIso(),
  version: 1,
  counts: {
    skills: collections.skills.length,
    agents: collections.agents.length,
    engines: collections.engines.length,
    workflows: collections.workflows.length,
    templates: collections.templates.length,
    evalSuites: collections.evalSuites.length,
    providers: providers.length,
    toolContracts: toolContracts.length,
    governanceCapabilities: governanceCapabilities.length,
    projects: projects.length
  },
  collections: {
    ...collections,
    providers,
    toolContracts,
    governanceCapabilities,
    projects
  },
  relationships
};

writeJson('storage/runtime/repo-index.json', index);

const lines = [
  '# AI Council Runtime Repository Index',
  '',
  `Generated: ${index.generatedAt}`,
  '',
  '## Counts',
  '',
  ...Object.entries(index.counts).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Projects',
  '',
  ...projects.map(project => `- ${project.id}: ${project.projectRel || 'no project dir'}; ${project.memoryRel || 'no memory'}; ${project.projectPackRel || 'no pack'}`),
  '',
  '## Runtime Relationships',
  '',
  `- workflows mapped: ${Object.keys(relationships.workflowToAgents).length}`,
  `- engines mapped: ${Object.keys(relationships.engineToSkills).length}`,
  `- agents mapped: ${Object.keys(relationships.agentToSkills).length}`
];
writeText('storage/runtime/repo-index.md', lines.join('\n'));

console.log('Runtime index generated: storage/runtime/repo-index.json');
console.log(`Indexed assets: ${Object.values(index.counts).reduce((sum, value) => sum + Number(value || 0), 0)}`);
