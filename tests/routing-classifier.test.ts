import assert from "node:assert/strict";
import { classifyCouncilRoute, MODEL_ROUTING_JSON_SCHEMA, Orchestrator, parseModelRouteJson } from "../packages/ai-core/src/index.js";

const explicit = classifyCouncilRoute({
  input: "@stl review the governance package for security gaps.",
  projectId: "ai-council",
  privacyLevel: "local-only",
  riskLevel: "medium"
});

assert.equal(explicit.source, "mention");
assert.equal(explicit.taskType, "security_review");
assert.equal(explicit.councilId, "security-council");
assert.equal(explicit.leadAgent, "software-architect");
assert.ok(explicit.supportAgents.includes("security-architect"));
assert.ok(explicit.requiredContext.includes("governance-files"));
assert.equal(explicit.confidence, "high");

const runtime = classifyCouncilRoute({
  input: "Review orchestrator response events and provider routing.",
  projectId: "ai-council",
  privacyLevel: "local-only"
});

assert.equal(runtime.source, "deterministic");
assert.equal(runtime.taskType, "runtime_review");
assert.equal(runtime.councilId, "architecture-council");
assert.equal(runtime.leadAgent, "software-architect");
assert.ok(runtime.supportAgents.includes("ai-engineer"));
assert.ok(runtime.requiredContext.includes("response-events"));

const simpleQuestion = classifyCouncilRoute({
  input: "what is the weather in Basel?",
  projectId: "ai-council",
  privacyLevel: "local-only"
});

assert.equal(simpleQuestion.taskType, "general");
assert.equal(simpleQuestion.confidence, "low");
assert.equal(simpleQuestion.councilId, "coding-council");
assert.deepEqual(simpleQuestion.supportAgents, []);

const risky = classifyCouncilRoute({
  input: "Push to GitHub after editing .env handling.",
  riskLevel: "high",
  privacyLevel: "local-only"
});

assert.equal(risky.councilId, "security-council");
assert.ok(risky.riskFlags.includes("request-risk:high"));
assert.ok(risky.riskFlags.includes("secret-sensitive"));
assert.ok(risky.riskFlags.includes("external-state-change"));

assert.equal(MODEL_ROUTING_JSON_SCHEMA.additionalProperties, false);
const parsedModel = parseModelRouteJson(`noise {"taskType":"repo_review","leadAgent":"software-architect","supportAgents":["qa-engineer","software-architect"],"confidence":"high","reason":"repo review","requiredContext":["repo-structure"],"riskFlags":["none"]}`);
assert.deepEqual(parsedModel, {
  taskType: "repo_review",
  leadAgent: "software-architect",
  supportAgents: ["qa-engineer"],
  confidence: "high",
  reason: "repo review",
  requiredContext: ["repo-structure"],
  riskFlags: ["none"]
});

assert.equal(parseModelRouteJson("not json"), null);

const orchestrator = new Orchestrator();
const result = await orchestrator.run({
  input: "@stl review the governance package for security gaps.",
  projectId: "ai-council",
  privacyLevel: "local-only",
  riskLevel: "medium"
});

assert.equal(result.selectedCouncil, "security-council");
assert.equal(result.agentsUsed[0], "software-architect");
assert.ok(result.agentsUsed.includes("security-architect"));

console.log("Routing classifier passed.");
