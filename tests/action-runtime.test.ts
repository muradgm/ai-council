import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { approvalFor, createActionPlan, decideAction, executeActionPlan, type ActionPlan } from "../packages/action-runtime/src/index.js";

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

const approvedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-council-action-execute-"));
fs.mkdirSync(path.join(approvedRoot, "docs"), { recursive: true });
fs.writeFileSync(path.join(approvedRoot, "docs/action-runtime.md"), "# Old docs\n");

const approvedPlan: ActionPlan = {
  id: "plan-approved",
  projectId: "ai-council",
  request: "execute approved low-risk writes",
  dryRun: false,
  actions: [
    {
      id: "act-create-plan",
      kind: "create_file",
      description: "Create approved action plan artifact.",
      target: "storage/governance/action-plans/approved-plan.md",
      contentPreview: "# Approved plan\n"
    },
    {
      id: "act-update-docs",
      kind: "update_file",
      description: "Update action runtime documentation.",
      target: "docs/action-runtime.md",
      contentPreview: "# New docs\n"
    },
    {
      id: "act-source-edit",
      kind: "update_file",
      description: "Attempt approved source edit.",
      target: "packages/action-runtime/src/action-executor.ts",
      contentPreview: "not allowed"
    }
  ]
};

const approvedReport = executeActionPlan(approvedPlan, {
  root: approvedRoot,
  writeReport: false,
  approvals: [
    approvalFor("act-create-plan", "test", "low-risk-file-write"),
    approvalFor("act-update-docs", "test", "low-risk-file-write"),
    approvalFor("act-source-edit", "test", "low-risk-file-write")
  ]
});

assert.equal(approvedReport.summary.executed, 2);
assert.equal(fs.readFileSync(path.join(approvedRoot, "storage/governance/action-plans/approved-plan.md"), "utf8"), "# Approved plan\n");
assert.equal(fs.readFileSync(path.join(approvedRoot, "docs/action-runtime.md"), "utf8"), "# New docs\n");
assert.ok(approvedReport.items.find(item => item.actionId === "act-update-docs")?.backupPath);
assert.equal(fs.existsSync(path.join(approvedRoot, "packages/action-runtime/src/action-executor.ts")), false);
assert.match(approvedReport.items.find(item => item.actionId === "act-source-edit")?.skippedReason || "", /Only approved non-source Markdown/);

assert.equal(decideAction({ id: "cmd-ok", kind: "run_command", description: "validate", command: "pnpm final:validate" }).status, "allow_with_logging");
assert.equal(decideAction({ id: "cmd-bad", kind: "run_command", description: "validate", command: "pnpm final:validate && rm -rf ." }).status, "blocked");

console.log("Action runtime behavior passed.");
