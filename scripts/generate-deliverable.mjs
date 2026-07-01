import fs from 'node:fs';
import path from 'node:path';

const [templateName, ...topicParts] = process.argv.slice(2);
const topic = topicParts.join(' ') || 'Untitled Project';
if (!templateName) {
  console.error('Usage: pnpm deliverables:generate <template-name> "<topic>"');
  process.exit(1);
}
const root = process.cwd();
const indexPath = path.join(root, 'packages', 'templates', 'templates.index.json');
const items = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const item = items.find(x => x.name === templateName);
if (!item) {
  console.error(`Unknown template: ${templateName}`);
  console.error('Run: pnpm templates:list');
  process.exit(1);
}
const templatePath = path.join(root, item.entrypoint);
let content = fs.readFileSync(templatePath, 'utf8');
const date = new Date().toISOString().slice(0, 10);
content = content
  .replaceAll('{{project}}', topic)
  .replaceAll('{{owner}}', 'AI Council')
  .replaceAll('{{date}}', date)
  .replaceAll('{{agent_or_workflow}}', (item.agents || []).slice(0, 3).join(', ') || 'AI Council')
  .replaceAll(/`\{\{fill_[^}]+\}\}`/g, '`TBD — fill with project-specific evidence and decisions.`');
const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'untitled';
const outDir = path.join(root, 'storage', 'deliverables');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${date}-${templateName}-${safeTopic}.md`);
fs.writeFileSync(outPath, content, 'utf8');
console.log(`Generated deliverable: ${path.relative(root, outPath)}`);
