import assert from "node:assert/strict";
import { Orchestrator } from "../packages/ai-core/src/index.js";

const orchestrator = new Orchestrator();
const result = await orchestrator.runSingleAgent({ input: "Review this feature for a small product team", projectId: "AI Council" }, "software-architect");

assert.equal(result.selectedCouncil, "single-agent");
assert.deepEqual(result.agentsUsed, ["software-architect"]);
assert.ok(result.answer.includes("software-architect"));

console.log("Single-agent mode passed.");
