import assert from "node:assert/strict";
import {
  advanceResponseEvents,
  createResponseEvents,
  failResponseEvents,
  finalizeResponseEvents
} from "../apps/web-console/src/state/response-events.js";
import { renderAgentCards } from "../apps/web-console/src/components/AgentCards.js";
import { renderStaticProgressPanel } from "../apps/web-console/src/components/ThinkingProgress.js";

const events = createResponseEvents("Review this repo and recommend the next step.", "AI Council");

assert.equal(events.length, 8);
assert.equal(events[0].type, "agent_started");
assert.equal(events[0].status, "active");
assert.equal(events.some(event => event.type === "approval_required"), true);
assert.equal(events.some(event => event.type === "final_answer_streamed"), true);

const advanced = advanceResponseEvents(events, 3);
assert.equal(advanced[0].status, "complete");
assert.equal(advanced[3].status, "active");
assert.equal(advanced[4].status, "pending");

const finalized = finalizeResponseEvents(advanced, {
  selectedCouncil: "architecture-council",
  selectedProvider: "ollama",
  agentsUsed: ["software-architect", "qa-engineer"],
  warnings: [],
  answer: "Read:\nA useful answer."
});

assert.equal(finalized.every(event => event.status === "complete" || event.status === "skipped"), true);
assert.equal(finalized.find(event => event.type === "approval_required")?.status, "skipped");
assert.equal(finalized.find(event => event.type === "risk_detected")?.status, "skipped");

const failed = failResponseEvents(advanced, new Error("network down"));
assert.equal(failed.some(event => event.status === "blocked"), true);

const progressPanel = renderStaticProgressPanel(finalized, ["software-architect", "qa-engineer"]);
assert.match(progressPanel, /Worked across agents/);
assert.match(progressPanel, /2 used/);
assert.match(progressPanel, /done/);

const agentCards = renderAgentCards(finalized, ["software-architect", "qa-engineer"]);
assert.match(agentCards, /Complete/);
assert.match(agentCards, /--agent-progress: 100%/);

console.log("Web console response event behavior passed.");
