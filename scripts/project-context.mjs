import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const project = process.argv[2];
if (!project) {
  console.error('Usage: pnpm project:context <project-name>');
  process.exit(1);
}

const rel = `storage/memory/projects/${project}/project-context.md`;
const full = path.join(root, rel);
if (!fs.existsSync(full)) {
  console.error(`No project context found for ${project}.`);
  console.error(`Expected: ${rel}`);
  console.error('Create one from packages/memory/templates/PROJECT_CONTEXT.md');
  process.exit(1);
}

console.log(fs.readFileSync(full, 'utf8'));
