#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const dirs = ['runs','traces','provider-calls','costs','artifacts','diagnostics','reports','incidents'];
for (const dir of dirs) {
  const full = path.join(root, 'storage', 'observability', dir);
  fs.mkdirSync(full, { recursive: true });
  const readme = path.join(full, 'README.md');
  if (!fs.existsSync(readme)) fs.writeFileSync(readme, `# ${dir}\n\nRuntime records for ${dir}.\n`, 'utf8');
}
console.log('Observability storage initialized.');
console.log('storage/observability/{runs,traces,provider-calls,costs,artifacts,diagnostics,reports,incidents}');
