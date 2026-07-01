#!/usr/bin/env node
import { toSlug, titleCase, writeText, exists, nowIso } from './lib/council-utils.mjs';

const [rawName, ...descriptionParts] = process.argv.slice(2);
if (!rawName) {
  console.error('Usage: node scripts/init-project.mjs <name> "<description>"');
  process.exit(1);
}
const slug = toSlug(rawName);
const title = titleCase(rawName);
const description = descriptionParts.join(' ').trim() || 'Project description to be defined.';

const projectReadme = `# ${title}\n\n${description}\n\n## Purpose\n\nDefine the project purpose, target user, problem, wedge, and first usable version.\n\n## Council Usage\n\nBefore working on this project, generate a context pack:\n\n\`\`\`bash\npnpm council context ${slug} "describe the task"\n\`\`\`\n\n## Current Status\n\n- Stage: discovery\n- Owner: AI Council\n- Created: ${nowIso()}\n`;

const config = `export default {\n  name: '${title}',\n  slug: '${slug}',\n  stage: 'discovery',\n  council: {\n    defaultWorkflow: 'project-discovery',\n    requiredDocs: ['README.md', 'PROJECT.md']\n  }\n};\n`;

const projectMd = `# ${title} Project Context\n\n## Description\n\n${description}\n\n## Product Wedge\n\nDefine the sharp wedge that makes this project worth building.\n\n## Target User\n\nTo be defined.\n\n## MVP\n\nTo be defined.\n\n## Risks\n\n- Product risk\n- Technical risk\n- Market risk\n- Execution risk\n`;

writeText(`projects/${slug}/README.md`, projectReadme);
writeText(`projects/${slug}/project.ai.config.ts`, config);
writeText(`projects/${slug}/PROJECT.md`, projectMd);
writeText(`storage/memory/projects/${title.replace(/\s+/g, '')}/project-context.md`, projectMd);
writeText(`storage/memory/projects/${title.replace(/\s+/g, '')}/decisions/README.md`, `# ${title} Decisions\n\nDecision records for ${title}.\n`);
writeText(`storage/memory/projects/${title.replace(/\s+/g, '')}/sessions/README.md`, `# ${title} Sessions\n\nSession summaries for ${title}.\n`);
writeText(`storage/memory/projects/${title.replace(/\s+/g, '')}/tasks/README.md`, `# ${title} Tasks\n\nTask state for ${title}.\n`);

console.log(`Created project: projects/${slug}`);
console.log(`Created memory: storage/memory/projects/${title.replace(/\s+/g, '')}`);
