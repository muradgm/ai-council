#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { automationRoot, now, markdownFile } from './lib/automation-utils.mjs';

function list(dir) {
  const full = path.join(automationRoot, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(x => !x.startsWith('.')).sort();
}
const sections = ['backlog','queue','sprints','releases','github-issues','codex-tasks','docs-updates'];
const body = `# Automation Report

Generated: ${now()}

${sections.map(s => `## ${s}

${list(s).map(x => `- ${x}`).join('\n') || '- None'}`).join('\n\n')}

## Recommended next actions

1. Keep backlog small and project-specific.
2. Convert top-priority backlog items into Codex task prompts.
3. Run release checklist before shipping.
4. Record traces after meaningful work.
`;
const file = markdownFile(path.join(automationRoot, 'reports'), `automation-report-${Date.now()}.md`, body);
console.log(`Automation report written: ${path.relative(process.cwd(), file)}`);
