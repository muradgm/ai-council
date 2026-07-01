import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'packages', 'skills', 'skills.index.json');
const skills = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log(`AI Council skills: ${skills.length}`);
for (const skill of skills) {
  console.log(`- ${skill.name}: ${skill.title}`);
}
