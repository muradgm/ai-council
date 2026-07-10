import assert from "node:assert/strict";
import { runE2eProof } from "../scripts/e2e-proof.js";

const result = await runE2eProof(false);

assert.equal(result.ok, true);
assert.equal(result.route.leadAgent, "software-architect");
assert.ok(result.route.supportAgents.includes("security-architect"));
assert.ok(result.contextFiles.some(file => file.includes("packages/action-runtime")));
assert.equal(result.response.selectedCouncil, "security-council");
assert.ok(result.response.eventTypes.includes("agent_started"));
assert.equal(result.actionReport.dryRun, true);
assert.equal(result.actionReport.executed, 0);
assert.ok(result.actionReport.approvalRequired > 0);

console.log("E2E proof passed.");
