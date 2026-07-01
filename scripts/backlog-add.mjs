#!/usr/bin/env node
import { loadBacklog, saveBacklog, taskId, now, riskFor, priorityFor, approvalRequired } from './lib/automation-utils.mjs';

const [project = 'general', title = 'Untitled task', description = ''] = process.argv.slice(2);
const backlog = loadBacklog(project);
const combined = `${title} ${description}`;
const risk = riskFor(combined);
const item = {
  id: taskId(project, title),
  project,
  title,
  description,
  status: 'todo',
  priority: priorityFor(combined),
  risk,
  approvalRequired: approvalRequired(risk, combined),
  createdAt: now(),
  acceptanceCriteria: [],
  blockedBy: []
};
backlog.items.push(item);
saveBacklog(project, backlog);
console.log(`Added backlog item: ${item.id}`);
console.log(`${item.priority} priority / ${item.risk} risk / approval required: ${item.approvalRequired}`);
