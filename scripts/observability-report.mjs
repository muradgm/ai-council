#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const base = path.join(root, 'storage', 'observability');
const dirs = ['runs','provider-calls','costs','artifacts','diagnostics','incidents'];
function readRecords(dir) {
  const full = path.join(base, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith('.json')).map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(full, f), 'utf8')); } catch { return null; }
  }).filter(Boolean);
}
const data = Object.fromEntries(dirs.map(d => [d, readRecords(d)]));
const totalCost = data.costs.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
const report = `# Observability Report\n\nGenerated: ${new Date().toISOString()}\n\n## Counts\n\n${dirs.map(d => `- ${d}: ${data[d].length}`).join('\n')}\n\n## Estimated Cost\n\n${totalCost.toFixed(4)}\n\n## Latest Runs\n\n${data.runs.slice(-5).map(r => `- ${r.timestamp} | ${r.project || 'general'} | ${r.task} | ${r.status}`).join('\n') || '- none'}\n\n## Latest Diagnostics\n\n${data.diagnostics.slice(-5).map(r => `- ${r.timestamp} | ${r.status} | ${r.summary}`).join('\n') || '- none'}\n`;
const dir = path.join(base, 'reports');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `observability-report-${new Date().toISOString().slice(0,10)}.md`);
fs.writeFileSync(file, report, 'utf8');
console.log(report);
console.log(`\nSaved: ${path.relative(root, file)}`);
