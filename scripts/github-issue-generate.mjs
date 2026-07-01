#!/usr/bin/env node
import path from 'node:path';
import { automationRoot, slug, riskFor, priorityFor, approvalRequired, now, markdownFile } from './lib/automation-utils.mjs';

const [project = 'general', ...taskParts] = process.argv.slice(2);
const task = taskParts.join(' ') || 'Untitled implementation task';
const risk = riskFor(task);
const priority = priorityFor(task);
const id = `${slug(project)}-issue-${Date.now()}`;
const body = `# GitHub Issue Draft — ${task}

## Project

${project}

## Summary

${task}

## Labels

- project:${slug(project)}
- priority:${priority}
- risk:${risk}

## Acceptance Criteria

- [ ] Implementation matches project context.
- [ ] Tests or checks are added where relevant.
- [ ] Documentation is updated.
- [ ] Quality gates pass.

## Risk / Approval

Risk: ${risk}

Approval required before external/destructive action: ${approvalRequired(risk, task)}

## Created

${now()}
`;
const file = markdownFile(path.join(automationRoot, 'github-issues'), `${id}.md`, body);
console.log(`GitHub issue draft written: ${path.relative(process.cwd(), file)}`);
