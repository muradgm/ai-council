import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'packages', 'workflows', 'workflows.index.json');
const workflows = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
for (const w of workflows) {
  console.log(`${w.name}	${w.category}	${w.title}`);
}
console.log(`
Total workflows: ${workflows.length}`);
