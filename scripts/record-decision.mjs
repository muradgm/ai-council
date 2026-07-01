import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const [project, decision, ...rationaleParts] = process.argv.slice(2);
const rationale = rationaleParts.join(' ') || 'Rationale to be expanded.';
if (!project || !decision) {
  console.error('Usage: pnpm memory:decision <project> "decision" "rationale"');
  process.exit(1);
}

const slug = decision.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'decision';
const date = new Date().toISOString().slice(0, 10);
const dir = path.join(root, 'storage', 'memory', 'decisions', project);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${date}-${slug}.md`);
const body = `# Decision Record: ${decision}\n\n## Date\n\n${date}\n\n## Project\n\n${project}\n\n## Status\n\naccepted\n\n## Context\n\nRecorded from AI Council runtime. Expand this section with relevant links and constraints.\n\n## Options considered\n\n1. Option A\n2. Option B\n3. Option C\n\n## Decision\n\n${decision}\n\n## Rationale\n\n${rationale}\n\n## Consequences\n\n- Update implementation and docs to reflect this decision.\n\n## Review date\n\nTBD\n`;
fs.writeFileSync(file, body, 'utf8');
console.log(`Decision recorded: ${path.relative(root, file)}`);
