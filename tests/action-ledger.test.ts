import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { appendActionLedger, approvalFor, createActionPlan, executeActionPlan, type ActionPlan } from "../packages/action-runtime/src/index.js";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-council-ledger-"));

const dryPlan = createActionPlan("ai-council", "update source runtime and create governed report", true);
const dryReport = executeActionPlan(dryPlan, { root: tmpRoot, writeReport: false });
const dryLedger = appendActionLedger(dryReport, { root: tmpRoot, runId: "run-dry" });

assert.equal(dryLedger.path, "storage/governance/action-ledger/actions.jsonl");
assert.equal(dryLedger.entries.length, dryReport.items.length);
assert.ok(dryLedger.entries.some(entry => entry.decision === "approval_required"));
assert.ok(dryLedger.entries.every(entry => entry.executed === false));
assert.ok(dryLedger.entries.every(entry => entry.validationStatus === "skipped"));

const ledgerFile = path.join(tmpRoot, dryLedger.path);
assert.ok(fs.existsSync(ledgerFile));
assert.equal(fs.readFileSync(ledgerFile, "utf8").trim().split("\n").length, dryReport.items.length);

const approvedPlan: ActionPlan = {
  id: "plan-ledger-approved",
  projectId: "ai-council",
  request: "write approved report",
  dryRun: false,
  actions: [
    {
      id: "act-report",
      kind: "create_file",
      description: "Create governed report artifact.",
      target: "storage/governance/reports/ledger-proof.md",
      contentPreview: "# Ledger proof\n"
    }
  ]
};

const approvedReport = executeActionPlan(approvedPlan, {
  root: tmpRoot,
  writeReport: false,
  approvals: [approvalFor("act-report", "test", "low-risk-file-write")]
});
const approvedLedger = appendActionLedger(approvedReport, {
  root: tmpRoot,
  runId: "run-approved",
  approvalIds: { "act-report": "approval-test" }
});

assert.equal(approvedLedger.entries[0].decision, "allowed");
assert.equal(approvedLedger.entries[0].approvalId, "approval-test");
assert.equal(approvedLedger.entries[0].executed, true);
assert.equal(approvedLedger.entries[0].validationStatus, "passed");
assert.equal(approvedLedger.entries[0].rollbackStatus, "available");

console.log("Action ledger passed.");
