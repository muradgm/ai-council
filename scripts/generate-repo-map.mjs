#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { counts, writeText, root, nowIso } from './lib/council-utils.mjs';

const ignore = new Set(['node_modules', '.git', 'dist', '.next']);
function tree(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  const entries = fs.readdirSync(full, { withFileTypes: true })
    .filter(e => !ignore.has(e.name))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
  const lines = [];
  for (const entry of entries) {
    const rel = path.join(dir, entry.name).replaceAll('\\', '/');
    lines.push(`${'  '.repeat(depth)}- ${entry.isDirectory() ? entry.name + '/' : entry.name}`);
    if (entry.isDirectory()) lines.push(...tree(rel, depth + 1, maxDepth));
  }
  return lines;
}
const c = counts();
const md = `# AI Council Repository Map\n\nGenerated: ${nowIso()}\n\n## Counts\n\n- Skills: ${c.skills}\n- Senior agents: ${c.agents}\n- Decision engines: ${c.engines}\n- Workflows: ${c.workflows}\n- Templates: ${c.templates}\n- Projects: ${c.projects}\n\n## Top-Level Tree\n\n\`\`\`text\nai-council/\n${tree('.', 1, 2).join('\n')}\n\`\`\`\n\n## Core Entry Points\n\n- AGENTS.md\n- packages/orchestrator/bootstrap.md\n- docs/codex-one-command-setup.md\n- docs/cli-reference.md\n- scripts/council.mjs\n`;
writeText('docs/repo-map.md', md);
console.log('Generated docs/repo-map.md');
