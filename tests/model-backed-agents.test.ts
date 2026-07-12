import assert from "node:assert/strict";
import { Orchestrator } from "../packages/ai-core/src/index.js";

const orchestrator = new Orchestrator();

const plannedEvents = orchestrator.planResponseEvents({
  input: "@stl review response events.",
  projectId: "ai-council",
  taskType: "runtime-review",
  privacyLevel: "local-only",
  riskLevel: "medium"
});

assert.equal(plannedEvents.length, 8);
assert.equal(plannedEvents[0].type, "context_read");
assert.equal(plannedEvents[0].status, "active");
assert.ok(plannedEvents.some(event => event.type === "agent_started" && event.detail.includes("Explicit @agent lead")));
assert.ok(plannedEvents.every(event => event.status === "pending" || event.status === "active"));

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
assert.ok(result.events?.some(event => event.type === "context_read" && event.status === "complete"));
assert.ok(result.events?.some(event => event.type === "agent_started" && event.detail.includes(result.selectedCouncil)));
assert.ok(result.events?.some(event => event.type === "final_answer_streamed" && event.status === "complete"));

const single = await orchestrator.runSingleAgent({
  input: "Source: packages/ai-core/src/agents/core/security-architect.agent.ts\nReview privacy and provider routing.",
  privacyLevel: "local-only",
  riskLevel: "high"
}, "security-architect");

assert.equal(single.selectedCouncil, "single-agent");
assert.equal(single.agentsUsed[0], "security-architect");
assert.ok(!single.answer.includes("Scaffolded agent"));
assert.ok(single.events?.some(event => event.type === "agent_started" && event.detail.includes("single-agent")));

console.log("Model-backed agent behavior passed.");
