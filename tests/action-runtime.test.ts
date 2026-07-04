import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createActionPlan, executeActionPlan } from "../packages/action-runtime/src/index.js";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-council-action-runtime-"));
const targetFile = "packages/ai-core/src/agents/core/software-architect.agent.ts";

const plan = createActionPlan(
  "ai-council",
  `update source runtime, install a package, delete ${targetFile}, and touch .env secret`,
  true
);

const report = executeActionPlan(plan, { root: tmpRoot });

assert.equal(report.dryRun, true);
assert.ok(report.reportPath);
assert.ok(fs.existsSync(path.join(tmpRoot, report.reportPath)));
assert.equal(report.summary.executed, 0);
assert.ok(report.summary.blocked >= 1);
assert.ok(report.summary.approvalRequired >= 2);

const decisions = report.items.map(item => item.decision.status);
assert.ok(decisions.includes("blocked"));
assert.ok(decisions.includes("approval_required"));
assert.ok(decisions.includes("allow_with_logging"));

for (const item of report.items) {
  assert.equal(item.executed, false);
  assert.match(item.skippedReason, /Dry-run mode/);
  assert.ok(item.rollback.strategy);
}

assert.equal(fs.existsSync(path.join(tmpRoot, targetFile)), false);

const simple = createActionPlan("ai-council", "create model-backed agent hardening plan", true);
const simpleReport = executeActionPlan(simple, { root: tmpRoot, writeReport: false });
assert.equal(simpleReport.summary.executed, 0);
assert.ok(simpleReport.items.some(item => item.kind === "create_file"));
assert.ok(simpleReport.items.some(item => item.command === "pnpm final:validate"));

console.log("Action runtime dry-run behavior passed.");
