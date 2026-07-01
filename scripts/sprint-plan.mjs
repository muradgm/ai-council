#!/usr/bin/env node
import path from 'node:path';
import { automationRoot, loadBacklog, slug, now, markdownFile } from './lib/automation-utils.mjs';

const [project = 'TradeFrame', goal = 'Next useful milestone', days = '7'] = process.argv.slice(2);
const backlog = loadBacklog(project);
const candidates = [...(backlog.items || [])]
  .filter(x => x.status !== 'done')
  .sort((a,b) => ({high:0,medium:1,low:2}[a.priority] - {high:0,medium:1,low:2}[b.priority]))
  .slice(0, 8);
const id = `${slug(project)}-sprint-${Date.now()}`;
const body = `# Sprint Plan — ${project}

## ID

${id}

## Goal

${goal}

## Duration

${days} days

## Selected Tasks

${candidates.map(t => `- ${t.id}: ${t.title} (${t.priority}/${t.risk})`).join('\n') || '- No candidate tasks found.'}

## Definition of Done

- [ ] Selected tasks implemented or explicitly deferred.
- [ ] Validation commands pass.
- [ ] Docs and memory updated.
- [ ] Risks reviewed.

## Created

${now()}
`;
const file = markdownFile(path.join(automationRoot, 'sprints'), `${id}.md`, body);
console.log(`Sprint plan written: ${path.relative(process.cwd(), file)}`);
