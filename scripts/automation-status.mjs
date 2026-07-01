#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { automationRoot } from './lib/automation-utils.mjs';

function count(dir, ext = null) {
  const full = path.join(automationRoot, dir);
  if (!fs.existsSync(full)) return 0;
  return fs.readdirSync(full).filter(f => !f.startsWith('.') && (!ext || f.endsWith(ext))).length;
}

const counts = {
  backlogFiles: count('backlog', '.json'),
  queueFiles: count('queue', '.json'),
  sprintPlans: count('sprints', '.md'),
  releases: count('releases', '.md'),
  githubIssues: count('github-issues', '.md'),
  codexTasks: count('codex-tasks', '.md'),
  docsUpdates: count('docs-updates', '.md'),
  reports: count('reports', '.md')
};
for (const [key, value] of Object.entries(counts)) console.log(`${key}: ${value}`);
