import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'packages', 'templates', 'templates.index.json');
const items = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
for (const item of items) {
  console.log(`${item.name.padEnd(32)} ${item.category.padEnd(14)} ${item.title}`);
}
console.log(`\nTemplates: ${items.length}`);
