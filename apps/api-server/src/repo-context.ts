import fs from "node:fs";
import path from "node:path";

const repoReviewTriggers = /\b(repo|repository|review|runtime|orchestrator|agent|provider|validation|eval|console|api|architecture|security|qa|push|github)\b/i;

const repoReviewFiles = [
  "AGENTS.md",
  "README.md",
  "package.json",
  "apps/api-server/src/main.ts",
  "apps/api-server/src/repo-context.ts",
  "apps/web-console/src/main.ts",
  "packages/ai-core/src/orchestrator/orchestrator.ts",
  "packages/ai-core/src/agents/base/agent-contract.ts",
  "packages/ai-core/src/agents/base/model-backed-agent.ts",
  "packages/ai-core/src/agents/base/agent-result-schema.ts",
  "packages/ai-providers/src/model-router.ts",
  "packages/ai-providers/src/providers/local/ollama.provider.ts",
  "scripts/final-validation.mjs",
  "tests/model-backed-agents.test.ts"
];

function shouldLoadRepoContext(projectId: string | undefined, input: string) {
  return projectId === "ai-council" || repoReviewTriggers.test(input);
}

function readSnippet(root: string, rel: string, maxChars: number) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return "";
  const stat = fs.statSync(full);
  if (!stat.isFile() || stat.size > 350_000) return "";
  return fs.readFileSync(full, "utf8").replace(/\r\n/g, "\n").trim().slice(0, maxChars);
}

function scoreFile(rel: string, input: string) {
  const hay = rel.toLowerCase();
  const words = input.toLowerCase().split(/[^a-z0-9-]+/).filter(word => word.length > 2);
  let score = repoReviewFiles.indexOf(rel) < 3 ? 3 : 0;
  for (const word of words) {
    if (hay.includes(word)) score += 2;
  }
  if (/runtime|orchestrator|agent|intelligen/i.test(input) && /ai-core|orchestrator|agent/.test(hay)) score += 5;
  if (/api|console|browser|web/i.test(input) && /api-server|web-console/.test(hay)) score += 5;
  if (/provider|ollama|model|local/i.test(input) && /ai-providers|ollama|model-router/.test(hay)) score += 5;
  if (/validation|eval|test|gate/i.test(input) && /test|final-validation|package\.json/.test(hay)) score += 5;
  if (/validation|gate/i.test(input) && /final-validation/.test(hay)) score += 6;
  return score;
}

export function buildRepoReviewContext(root: string, projectId: string | undefined, input: string) {
  if (!shouldLoadRepoContext(projectId, input)) return "";

  let remaining = 10_000;
  const selected = repoReviewFiles
    .map(rel => ({ rel, score: scoreFile(rel, input) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || repoReviewFiles.indexOf(a.rel) - repoReviewFiles.indexOf(b.rel))
    .slice(0, 11);

  const sections: string[] = [];
  for (const item of selected) {
    if (remaining <= 400) break;
    const text = readSnippet(root, item.rel, Math.min(950, remaining));
    if (!text) continue;
    const section = `Source: ${item.rel}\n${text}`;
    sections.push(section);
    remaining -= section.length;
  }

  return sections.join("\n\n---\n\n");
}
