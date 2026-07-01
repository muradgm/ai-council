import fs from 'node:fs';
import path from 'node:path';

const query = process.argv.slice(2).join(' ').toLowerCase();
if (!query) {
  console.error('Usage: pnpm agents:route "describe the task"');
  process.exit(1);
}

const root = process.cwd();
const indexPath = path.join(root, 'packages', 'senior-agents', 'agents.index.json');
const agents = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

function scoreAgent(agent) {
  let score = 0;
  for (const keyword of agent.keywords || []) {
    if (query.includes(keyword.toLowerCase())) score += keyword.length > 6 ? 3 : 2;
  }
  for (const skill of agent.skills || []) {
    const normalized = skill.replaceAll('-', ' ');
    if (query.includes(normalized)) score += 2;
  }
  if (query.includes(agent.slug.replaceAll('-', ' '))) score += 5;
  return score;
}

const ranked = agents
  .map(agent => ({...agent, score: scoreAgent(agent)}))
  .filter(agent => agent.score > 0)
  .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
  .slice(0, 5);

if (ranked.length === 0) {
  console.log('No strong match. Default lead agent: ceo');
  process.exit(0);
}

console.log('Recommended lead/support agents:');
for (const agent of ranked) {
  console.log(`- ${agent.slug} (${agent.title}) score=${agent.score}`);
  console.log(`  skills: ${agent.skills.join(', ')}`);
}
