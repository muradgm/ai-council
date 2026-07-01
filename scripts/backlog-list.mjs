#!/usr/bin/env node
import { loadBacklog } from './lib/automation-utils.mjs';

const [project = 'TradeFrame'] = process.argv.slice(2);
const backlog = loadBacklog(project);
console.log(`# Backlog: ${project}`);
for (const item of backlog.items || []) {
  console.log(`- [${item.status}] ${item.id} — ${item.title} (${item.priority}/${item.risk})`);
}
if (!backlog.items?.length) console.log('No backlog items found.');
