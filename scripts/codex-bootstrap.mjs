#!/usr/bin/env node
import { routeRequest, projectCandidates, writeText, nowIso } from './lib/council-utils.mjs';

const [project = 'general', ...taskParts] = process.argv.slice(2);
const task = taskParts.join(' ').trim() || 'Initialize AI Council and prepare for the next task.';
const routes = routeRequest(`${project} ${task}`, 5);
const candidates = projectCandidates(project);

const prompt = `# Codex Bootstrap Prompt\n\nGenerated: ${nowIso()}\n\nYou are working inside the AI Council repository.\n\n## Startup Order\n\nRead these files first:\n\n1. AGENTS.md\n2. packages/orchestrator/bootstrap.md\n3. docs/codex-startup-guide.md\n4. docs/codex-one-command-setup.md\n5. docs/developer-experience.md\n\n## Target Project\n\nRequested project: ${project}\n\nPossible project paths:\n${candidates.length ? candidates.map(c => `- ${c.type}: ${c.rel}`).join('\n') : '- No exact project match. Use projects/_template if creating a new project.'}\n\n## Task\n\n${task}\n\n## Recommended Routing\n\n### Agents\n${routes.agents.map(x => `- ${x.id}`).join('\n') || '- No strong agent match'}\n\n### Decision Engines\n${routes.engines.map(x => `- ${x.id}`).join('\n') || '- No strong engine match'}\n\n### Workflows\n${routes.workflows.map(x => `- ${x.id}`).join('\n') || '- No strong workflow match'}\n\n### Skills\n${routes.skills.map(x => `- ${x.id}`).join('\n') || '- No strong skill match'}\n\n## Operating Rules\n\n- Search the repo before creating files.\n- Reuse existing packages, templates, workflows, and decision engines.\n- Do not duplicate knowledge files.\n- For architecture, security, trading, finance, or product-risk decisions, produce a decision memo before implementation.\n- Keep changes small and verifiable.\n- Run pnpm validate:knowledge and pnpm council:doctor after structural changes.\n- Update project memory, task state, and docs when the work changes direction or creates a decision.\n`;

const out = `storage/context-packs/codex-bootstrap-${project.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
writeText(out, prompt);
console.log(prompt);
console.log(`\nSaved: ${out}`);
