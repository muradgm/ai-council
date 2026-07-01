import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const project = process.argv[2];
const task = process.argv.slice(3).join(' ') || 'General project work';
if (!project) {
  console.error('Usage: pnpm memory:context <project-name> "task description"');
  process.exit(1);
}

function readIfExists(rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8').trim() : '';
}
function listRecent(rel, limit = 5) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  const files = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir)) {
      const p = path.join(dir, entry);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p);
      else if (entry.endsWith('.md') && entry !== 'README.md') files.push({ p, mtime: stat.mtimeMs });
    }
  };
  walk(full);
  return files.sort((a,b) => b.mtime - a.mtime).slice(0, limit).map(f => path.relative(root, f.p));
}

function inferResources(text) {
  const q = text.toLowerCase();
  const agents = new Set(['product-manager']);
  const skills = new Set(['product-management']);
  const engines = new Set(['product-strategy-engine']);
  let workflow = 'feature-planning';

  if (q.includes('trading') || q.includes('forex') || q.includes('journal')) {
    ['forex-trader','risk-manager','quant-researcher','financial-analyst'].forEach(x => agents.add(x));
    ['forex-trading','risk-management','quantitative-analysis','finance'].forEach(x => skills.add(x));
    ['trading-analysis-engine','risk-management-engine'].forEach(x => engines.add(x));
    workflow = 'trading-system-review';
  }
  if (q.includes('architecture') || q.includes('database') || q.includes('backend')) {
    ['software-architect','backend-engineer'].forEach(x => agents.add(x));
    ['software-architecture','database','backend'].forEach(x => skills.add(x));
    engines.add('architecture-engine');
    workflow = 'architecture-review';
  }
  if (q.includes('brand') || q.includes('logo') || q.includes('identity')) {
    ['senior-brand-designer','brand-strategist'].forEach(x => agents.add(x));
    ['branding','logo-design','design-system'].forEach(x => skills.add(x));
    engines.add('branding-engine');
    workflow = 'brand-identity-workflow';
  }
  if (q.includes('code') || q.includes('bug') || q.includes('refactor')) {
    ['senior-full-stack-engineer','software-architect'].forEach(x => agents.add(x));
    ['typescript','software-architecture','testing'].forEach(x => skills.add(x));
    engines.add('code-review-engine');
    workflow = q.includes('bug') ? 'bug-investigation' : 'code-review';
  }
  return { agents: [...agents], skills: [...skills], engines: [...engines], workflow };
}

const projectContextRel = `storage/memory/projects/${project}/project-context.md`;
const projectContext = readIfExists(projectContextRel) || `No project context exists yet at ${projectContextRel}. Create one.`;
const recentDecisions = listRecent(`storage/memory/decisions/${project}`, 5);
const recentSessions = listRecent(`storage/memory/sessions/${project}`, 5);
const taskFiles = listRecent(`storage/memory/tasks/${project}`, 3);
const inferred = inferResources(`${project} ${task} ${projectContext}`);

const outDir = path.join(root, 'storage', 'context-packs', project);
fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outRel = `storage/context-packs/${project}/${stamp}.context-pack.md`;
const latestRel = `storage/context-packs/${project}/latest.context-pack.md`;

const pack = `# AI Council Context Pack\n\n## Active project\n\n${project}\n\n## Current task\n\n${task}\n\n## Non-negotiable instructions\n\n- Read existing files before creating new files.\n- Do not duplicate packages, agents, skills, engines, workflows, or templates.\n- Treat memory as advisory when it conflicts with source code or explicit user instructions.\n- Update docs and memory after meaningful work.\n\n## Project context\n\nLoaded from: \`${projectContextRel}\`\n\n${projectContext}\n\n## Recent decision records\n\n${recentDecisions.length ? recentDecisions.map(x => `- ${x}`).join('\n') : '- None found.'}\n\n## Recent sessions\n\n${recentSessions.length ? recentSessions.map(x => `- ${x}`).join('\n') : '- None found.'}\n\n## Active task files\n\n${taskFiles.length ? taskFiles.map(x => `- ${x}`).join('\n') : '- None found.'}\n\n## Recommended senior agents\n\n${inferred.agents.map(x => `- ${x}`).join('\n')}\n\n## Recommended skills\n\n${inferred.skills.map(x => `- ${x}`).join('\n')}\n\n## Recommended decision engines\n\n${inferred.engines.map(x => `- ${x}`).join('\n')}\n\n## Recommended workflow\n\n- ${inferred.workflow}\n\n## Output expectations\n\n- Implementation plan before broad changes.\n- Clear file changes.\n- Tests or validation where possible.\n- Updated documentation.\n- Session summary when done.\n`;

fs.writeFileSync(path.join(root, outRel), pack, 'utf8');
fs.writeFileSync(path.join(root, latestRel), pack, 'utf8');
console.log(`Context pack generated: ${outRel}`);
console.log(`Latest pointer updated: ${latestRel}`);
