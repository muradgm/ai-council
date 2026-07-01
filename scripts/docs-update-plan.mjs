#!/usr/bin/env node
import path from 'node:path';
import { automationRoot, slug, now, markdownFile } from './lib/automation-utils.mjs';

const [project = 'TradeFrame', ...changeParts] = process.argv.slice(2);
const change = changeParts.join(' ') || 'Recent implementation change';
const id = `${slug(project)}-docs-${Date.now()}`;
const body = `# Documentation Update Plan — ${project}

## Change

${change}

## Documents to check

- [ ] projects/${project}/PROJECT.md
- [ ] packages/project-packs/${project}/PROJECT_PACK.md
- [ ] storage/memory/projects/${project}/project-context.md
- [ ] storage/memory/projects/${project}/task-state.md
- [ ] storage/memory/projects/${project}/decision-records.md
- [ ] README.md if commands or setup changed
- [ ] AGENTS.md if operating rules changed

## Update rules

- Prefer factual summaries over vague notes.
- Record why a decision changed, not only what changed.
- Mention commands that verify the change.

## Created

${now()}
`;
const file = markdownFile(path.join(automationRoot, 'docs-updates'), `${id}.md`, body);
console.log(`Docs update plan written: ${path.relative(process.cwd(), file)}`);
