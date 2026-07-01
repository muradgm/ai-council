import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredPackages = ['packages/skills', 'packages/senior-agents', 'packages/decision-engines'];

for (const pkg of requiredPackages) {
  if (!existsSync(join(root, pkg))) {
    throw new Error(`Missing required package: ${pkg}`);
  }
}

const skillsPath = join(root, 'packages/skills');
const skills = readdirSync(skillsPath, { withFileTypes: true }).filter((d) => d.isDirectory());

for (const skill of skills) {
  const base = join(skillsPath, skill.name);
  if (skill.name === 'node_modules') continue;
  if (!existsSync(join(base, 'SKILL.md'))) {
    throw new Error(`Skill missing SKILL.md: ${skill.name}`);
  }
  if (!existsSync(join(base, 'skill.json'))) {
    throw new Error(`Skill missing skill.json: ${skill.name}`);
  }
}

console.log(`Knowledge structure OK. Skills found: ${skills.length}`);
