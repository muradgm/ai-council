import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function countMarkdown(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return 0;
  let count = 0;
  const walk = dir => {
    for (const entry of fs.readdirSync(dir)) {
      const p = path.join(dir, entry);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p);
      else if (entry.endsWith('.md') && entry !== 'README.md') count++;
    }
  };
  walk(full);
  return count;
}

const rows = [
  ['Project contexts', 'storage/memory/projects'],
  ['Sessions', 'storage/memory/sessions'],
  ['Decisions', 'storage/memory/decisions'],
  ['Tasks', 'storage/memory/tasks'],
  ['Risks', 'storage/memory/risks'],
  ['Context packs', 'storage/context-packs']
];

console.log('AI Council Memory Status');
console.log('------------------------');
for (const [label, rel] of rows) {
  console.log(`${label}: ${countMarkdown(rel)}`);
}
