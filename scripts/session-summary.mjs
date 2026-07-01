import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const [project, ...summaryParts] = process.argv.slice(2);
const summary = summaryParts.join(' ') || 'Session summary to be expanded.';
if (!project) {
  console.error('Usage: pnpm memory:session <project> "summary"');
  process.exit(1);
}
const now = new Date();
const date = now.toISOString().slice(0, 10);
const stamp = now.toISOString().replace(/[:.]/g, '-');
const dir = path.join(root, 'storage', 'memory', 'sessions', project);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${stamp}.session-summary.md`);
const body = `# Session Summary\n\n## Date\n\n${date}\n\n## Project\n\n${project}\n\n## User goal\n\n${summary}\n\n## Work completed\n\n- TODO: list completed work.\n\n## Files changed\n\n- TODO: list files.\n\n## Decisions made\n\n- TODO: list decisions or link decision records.\n\n## Blockers\n\n- None recorded.\n\n## Next actions\n\n- TODO: list next actions.\n\n## Context to carry forward\n\n${summary}\n`;
fs.writeFileSync(file, body, 'utf8');
console.log(`Session summary created: ${path.relative(root, file)}`);
