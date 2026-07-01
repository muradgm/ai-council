#!/usr/bin/env node
import path from 'node:path';
import { automationRoot, slug, riskFor, now, markdownFile } from './lib/automation-utils.mjs';

const [project = 'TradeFrame', ...scopeParts] = process.argv.slice(2);
const scope = scopeParts.join(' ') || 'Next release';
const risk = riskFor(scope);
const id = `${slug(project)}-release-${Date.now()}`;
const body = `# Release Checklist — ${project}

## Scope

${scope}

## Risk

${risk}

## Required Checks

- [ ] Build passes.
- [ ] Tests pass.
- [ ] Knowledge validation passes.
- [ ] Relevant evals pass.
- [ ] Quality gates pass.
- [ ] Security and privacy risks reviewed.
- [ ] Trading/finance disclaimers reviewed if relevant.
- [ ] Documentation updated.
- [ ] Memory and decision records updated.
- [ ] Rollback notes written if release touches runtime behavior.

## Commands

\`\`\`bash
pnpm validate:knowledge
pnpm gates:run
pnpm evals:run
\`\`\`

## Created

${now()}
`;
const file = markdownFile(path.join(automationRoot, 'releases'), `${id}.md`, body);
console.log(`Release checklist written: ${path.relative(process.cwd(), file)}`);
