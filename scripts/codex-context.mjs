#!/usr/bin/env node
import { readText, writeText, routeRequest, projectCandidates, nowIso } from './lib/council-utils.mjs';

const [project = 'general', ...taskParts] = process.argv.slice(2);
const task = taskParts.join(' ').trim() || 'Prepare a Codex context pack.';
const routes = routeRequest(`${project} ${task}`, 4);
const candidates = projectCandidates(project);
const memoryRel = candidates.find(c => c.type === 'memory')?.rel + '/project-context.md';
const projectRel = candidates.find(c => c.type === 'project')?.rel;

const content = `# Codex Context Pack\n\nGenerated: ${nowIso()}\n\n## Project\n\n${project}\n\nProject path: ${projectRel || 'No exact match'}\n\n## Task\n\n${task}\n\n## Required Reading\n\n### AGENTS.md\n\n${readText('AGENTS.md').slice(0, 4000)}\n\n### Orchestrator Bootstrap\n\n${readText('packages/orchestrator/bootstrap.md').slice(0, 4000)}\n\n### Project Memory\n\n${memoryRel && !memoryRel.startsWith('undefined') ? readText(memoryRel, 'No memory record found.') : 'No memory record found.'}\n\n## Route\n\n### Agents\n${routes.agents.map(x => `- ${x.id}: ${x.rel}`).join('\n') || '- No strong match'}\n\n### Engines\n${routes.engines.map(x => `- ${x.id}: ${x.rel}`).join('\n') || '- No strong match'}\n\n### Workflows\n${routes.workflows.map(x => `- ${x.id}: ${x.rel}`).join('\n') || '- No strong match'}\n\n### Skills\n${routes.skills.map(x => `- ${x.id}: ${x.rel}`).join('\n') || '- No strong match'}\n\n### Templates\n${routes.templates.map(x => `- ${x.id}: ${x.rel}`).join('\n') || '- No strong match'}\n\n## Execution Contract\n\n1. Confirm target files before editing.\n2. Use the listed route unless repo search proves a better route.\n3. Create or update tests when code behavior changes.\n4. Run diagnostics.\n5. Update memory and docs.\n`;

const out = `storage/context-packs/${project.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-codex-context.md`;
writeText(out, content);
console.log(`Created ${out}`);
console.log('\nUse this in Codex as the startup context for the task.');
