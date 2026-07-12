import fs from "node:fs";
import path from "node:path";
import type { ActionReport, ActionReportItem } from "./action-report.js";

export type ActionLedgerEntry = {
  id: string;
  runId: string;
  planId: string;
  actionId: string;
  actionKind: string;
  target?: string;
  decision: "allowed" | "approval_required" | "blocked";
  approvalId?: string;
  executed: boolean;
  validationStatus?: "passed" | "failed" | "skipped";
  rollbackStatus?: "not_needed" | "available" | "executed" | "failed";
  createdAt: string;
};

export type AppendActionLedgerOptions = {
  root?: string;
  ledgerPath?: string;
  runId?: string;
  approvalIds?: Record<string, string>;
};

const defaultLedgerPath = "storage/governance/action-ledger/actions.jsonl";

function ledgerDecision(status: string): ActionLedgerEntry["decision"] {
  if (status === "blocked") return "blocked";
  if (status === "approval_required") return "approval_required";
  return "allowed";
}

function validationStatus(item: ActionReportItem): ActionLedgerEntry["validationStatus"] {
  if (!item.executed) return "skipped";
  if (!item.result) return "skipped";
  return item.result.ok ? "passed" : "failed";
}

function rollbackStatus(item: ActionReportItem): ActionLedgerEntry["rollbackStatus"] {
  if (item.backupPath) return "available";
  if (item.rollback?.strategy && item.rollback.strategy !== "none_needed") return "available";
  return "not_needed";
}

function entryId(runId: string, actionId: string) {
  return `${runId}:${actionId}`;
}

export function actionLedgerEntries(report: ActionReport, options: AppendActionLedgerOptions = {}): ActionLedgerEntry[] {
  const runId = options.runId || report.id;
  return report.items.map(item => ({
    id: entryId(runId, item.actionId),
    runId,
    planId: report.id,
    actionId: item.actionId,
    actionKind: item.kind,
    target: item.target || item.command,
    decision: ledgerDecision(item.decision.status),
    approvalId: options.approvalIds?.[item.actionId],
    executed: item.executed,
    validationStatus: validationStatus(item),
    rollbackStatus: rollbackStatus(item),
    createdAt: report.createdAt
  }));
}

export function appendActionLedger(report: ActionReport, options: AppendActionLedgerOptions = {}) {
  const root = options.root || process.cwd();
  const ledgerRel = options.ledgerPath || defaultLedgerPath;
  const ledgerFile = path.join(root, ledgerRel);
  const entries = actionLedgerEntries(report, options);
  fs.mkdirSync(path.dirname(ledgerFile), { recursive: true });
  fs.appendFileSync(ledgerFile, entries.map(entry => JSON.stringify(entry)).join("\n") + "\n");
  return {
    path: ledgerRel,
    entries
  };
}
