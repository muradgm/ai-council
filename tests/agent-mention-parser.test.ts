import assert from "node:assert/strict";
import { Orchestrator, parseAgentMentions } from "../packages/ai-core/src/index.js";

const parsed = parseAgentMentions("@stl review governance with @sec and @qa");

assert.equal(parsed.requestedLeadAgent, "software-architect");
assert.equal(parsed.requestedLeadLabel, "Senior Tech Lead");
assert.deepEqual(parsed.mentions.map(mention => mention.agentId), [
  "software-architect",
  "security-architect",
  "qa-engineer"
]);

const alias = parseAgentMentions("Can @product-manager review the roadmap?");
assert.equal(alias.requestedLeadAgent, "product-strategist");

const help = parseAgentMentions("@help");
assert.equal(help.controlIntent, "help");

const list = parseAgentMentions("Show @agents");
assert.equal(list.controlIntent, "list-agents");

const unknown = parseAgentMentions("@wizard review this");
assert.deepEqual(unknown.unknownTokens, ["@wizard"]);
assert.equal(unknown.requestedLeadAgent, undefined);

const orchestrator = new Orchestrator();

const result = await orchestrator.run({
  input: "@sec review provider routing and approval gates.",
  projectId: "ai-council",
  privacyLevel: "local-only",
  riskLevel: "medium"
});

assert.equal(result.agentsUsed[0], "security-architect");
assert.ok(result.events?.some(event => event.type === "agent_started" && event.detail.includes("Explicit @agent lead: Security Architect")));
assert.ok(result.answer.includes("Agents used: security-architect"));

const helpResponse = await orchestrator.run({ input: "@help", privacyLevel: "local-only" });
assert.equal(helpResponse.selectedCouncil, "mention-help");
assert.equal(helpResponse.selectedProvider, "local-rule");
assert.ok(helpResponse.answer.includes("@stl -> Senior Tech Lead"));

console.log("Agent mention parser passed.");
