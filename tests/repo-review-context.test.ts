import assert from "node:assert/strict";
import { buildRepoReviewContext } from "../apps/api-server/src/repo-context.js";

const context = buildRepoReviewContext(
  process.cwd(),
  "ai-council",
  "Review the AI Council runtime, model-backed agents, provider routing, and validation gates."
);

assert.ok(context.includes("Source: packages/ai-core/src/orchestrator/orchestrator.ts"));
assert.ok(context.includes("Source: packages/ai-core/src/agents/base/model-backed-agent.ts"));
assert.ok(context.includes("Source: packages/ai-providers/src/providers/local/ollama.provider.ts"));
assert.ok(context.includes("Source: scripts/final-validation.mjs"));
assert.ok(context.length <= 11_000);

const unrelated = buildRepoReviewContext(process.cwd(), "Swimly", "Write copy for a pool recommendation landing page.");
assert.equal(unrelated, "");

console.log("Repo-review context behavior passed.");
