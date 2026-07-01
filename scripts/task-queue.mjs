#!/usr/bin/env node
import path from 'node:path';
import { automationRoot, appendJsonArray, readJson, writeJson, taskId, riskFor, priorityFor, approvalRequired, now } from './lib/automation-utils.mjs';

const [action = 'list', project = 'general', ...rest] = process.argv.slice(2);
const file = path.join(automationRoot, 'queue', `${project}.json`);
if (action === 'add') {
  const title = rest.join(' ') || 'Untitled queued task';
  const risk = riskFor(title);
  const item = { id: taskId(project, title), project, title, status: 'queued', priority: priorityFor(title), risk, approvalRequired: approvalRequired(risk, title), createdAt: now() };
  appendJsonArray(file, item);
  console.log(`Queued task: ${item.id}`);
} else if (action === 'next') {
  const q = readJson(file, []);
  const next = q.find(x => x.status === 'queued') || q[0];
  if (!next) console.log('No queued tasks.'); else console.log(`${next.id}: ${next.title} (${next.priority}/${next.risk})`);
} else if (action === 'done') {
  const [id] = rest;
  const q = readJson(file, []);
  for (const item of q) if (item.id === id) { item.status = 'done'; item.doneAt = now(); }
  writeJson(file, q);
  console.log(`Marked done: ${id}`);
} else {
  const q = readJson(file, []);
  console.log(`# Queue: ${project}`);
  for (const item of q) console.log(`- [${item.status}] ${item.id} — ${item.title} (${item.priority}/${item.risk})`);
  if (!q.length) console.log('No queued tasks.');
}
