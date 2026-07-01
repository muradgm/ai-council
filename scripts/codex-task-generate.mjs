#!/usr/bin/env node
import path from 'node:path';
import { automationRoot, slug, riskFor, approvalRequired, now, markdownFile } from './lib/automation-utils.mjs';

const [project = 'TradeFrame', ...taskParts] = process.argv.slice(2);
const task = taskParts.join(' ') || 'Build the next project milestone';
const risk = riskFor(task);
const id = `${slug(project)}-codex-${Date.now()}`;
const body = `# Codex Task Prompt — ${project}

You are operating inside the AI Council repository.

## Task

${task}

## Required reading order

1. AGENTS.md
2. packages/orchestrator/bootstrap.md
3. packages/project-packs/${project}/PROJECT_PACK.md if it exists
4. projects/${project}/PROJECT.md if it exists
5. storage/memory/projects/${project}/project-context.md if it exists
6. Relevant skills, agents, workflows, decision engines, and templates

## Execution rules

- Search before creating files.
- Reuse existing packages.
- Make small, testable changes.
- Do not perform external, destructive, production, financial, or secret-related actions without explicit approval.
- Risk level: ${risk}.
- Approval required: ${approvalRequired(risk, task)}.

## Verification

Run relevant commands, starting with:

\`\`\`bash
pnpm validate:knowledge
pnpm gates:run
\`\`\`

## Documentation updates

Update project docs, task state, decision records, and memory where relevant.

## Created

${now()}
`;
const file = markdownFile(path.join(automationRoot, 'codex-tasks'), `${id}.md`, body);
console.log(`Codex task prompt written: ${path.relative(process.cwd(), file)}`);
