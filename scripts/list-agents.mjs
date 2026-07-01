import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'packages', 'senior-agents', 'agents.index.json');
const agents = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log(`AI Council senior agents: ${agents.length}`);
const groups = [...new Set(agents.map(agent => agent.group))].sort();
for (const group of groups) {
  console.log(`
${group}`);
  for (const agent of agents.filter(a => a.group === group)) {
    console.log(`- ${agent.slug}: ${agent.title}`);
  }
}
