#!/usr/bin/env node
import { ensureDir, automationRoot } from './lib/automation-utils.mjs';

for (const dir of ['backlog','queue','sprints','releases','github-issues','codex-tasks','docs-updates','reports']) {
  ensureDir(`${automationRoot}/${dir}`);
}
console.log('Automation storage initialized at storage/automation/.');
