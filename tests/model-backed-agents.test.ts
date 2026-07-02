import assert from "node:assert/strict";
import { Orchestrator } from "../packages/ai-core/src/index.js";

const orchestrator = new Orchestrator();

const result = await orchestrator.run({
  input: [
    "Review AI Council runtime reliability.",
    "",
    "Source: packages/ai-core/src/orchestrator/orchestrator.ts",
    "The orchestrator selects councils, runs agents, and synthesizes answers.",
    "",
    "Source: packages/ai-core/src/agents/core/software-architect.agent.ts",
    "The software architect should provide structured findings."
  ].join("\n"),
  projectId: "ai-council",
  taskType: "architecture-review",
  privacyLevel: "local-only",
  riskLevel: "medium"
});

assert.ok(result.answer.includes("Findings:"));
assert.ok(result.answer.includes("Structured findings:"));
assert.ok(result.answer.includes("Uncertainty:"));
assert.ok(!result.answer.includes("Scaffolded agent"));

const single = await orchestrator.runSingleAgent({
  input: "Source: packages/ai-core/src/agents/core/security-architect.agent.ts\nReview privacy and provider routing.",
  privacyLevel: "local-only",
  riskLevel: "high"
}, "security-architect");

assert.equal(single.selectedCouncil, "single-agent");
assert.equal(single.agentsUsed[0], "security-architect");
assert.ok(!single.answer.includes("Scaffolded agent"));

console.log("Model-backed agent behavior passed.");
