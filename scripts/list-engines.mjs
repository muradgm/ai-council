
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'packages', 'decision-engines', 'index.json');

if (!fs.existsSync(indexPath)) {
  console.error('Missing packages/decision-engines/index.json');
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
for (const engine of registry.engines) {
  console.log(`${engine.name}\t${engine.category}\t${engine.title}`);
}
console.log(`\nTotal decision engines: ${registry.engineCount}`);
