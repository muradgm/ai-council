import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dirs = [
  'storage/memory/projects',
  'storage/memory/sessions',
  'storage/memory/decisions',
  'storage/memory/tasks',
  'storage/memory/risks',
  'storage/memory/glossary',
  'storage/memory/research',
  'storage/context-packs'
];

for (const dir of dirs) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
  const readme = path.join(root, dir, 'README.md');
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(readme, `# ${path.basename(dir)}\n\nRuntime directory for AI Council memory.\n`, 'utf8');
  }
}

console.log('Memory runtime initialized.');
console.log('Storage root: storage/memory');
console.log('Context packs: storage/context-packs');
