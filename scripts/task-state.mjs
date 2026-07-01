import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const [project, ...taskParts] = process.argv.slice(2);
const task = taskParts.join(' ') || '';
if (!project || !task) {
  console.error('Usage: pnpm memory:task <project> "task title"');
  process.exit(1);
}
const slug = task.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'task';
const dir = path.join(root, 'storage', 'memory', 'tasks', project);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${slug}.task-state.md`);
if (fs.existsSync(file)) {
  console.log(fs.readFileSync(file, 'utf8'));
  process.exit(0);
}
const body = `# Task State: ${task}\n\n## Project\n\n${project}\n\n## Status\n\ntodo\n\n## Acceptance criteria\n\n- Define acceptance criteria before implementation.\n\n## Current plan\n\n1. Inspect existing files.\n2. Route agents, skills, engines, and workflow.\n3. Implement minimal safe change.\n4. Validate.\n5. Update docs and memory.\n\n## Blockers\n\n- None recorded.\n\n## Owner agents\n\n- product-manager\n- software-architect\n\n## Relevant skills\n\n- product-management\n- software-architecture\n\n## Relevant engines\n\n- product-strategy-engine\n- architecture-engine\n\n## Notes\n\nCreated by memory runtime.\n`;
fs.writeFileSync(file, body, 'utf8');
console.log(`Task state created: ${path.relative(root, file)}`);
