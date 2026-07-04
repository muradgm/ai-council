import fs from "node:fs";
import path from "node:path";
import type { ActionPlan } from "./action-intent.js";
import type { GovernanceDecision } from "./governance-decision.js";
import type { RollbackPlan } from "./rollback.js";

export type ActionReportItem = {
  actionId: string;
  kind: string;
  description: string;
  target?: string;
  command?: string;
  decision: GovernanceDecision;
  rollback: RollbackPlan;
  executed: boolean;
  skippedReason: string;
  backupPath?: string;
  result?: {
    ok: boolean;
    status?: number | null;
    stdout?: string;
    stderr?: string;
  };
};

export type ActionReport = {
  id: string;
  createdAt: string;
  projectId: string;
  request: string;
  dryRun: boolean;
  summary: {
    total: number;
    allowed: number;
    approvalRequired: number;
    blocked: number;
    executed: number;
  };
  items: ActionReportItem[];
  reportPath?: string;
};

function reportId() {
  return `action-${new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").replace("Z", "")}`;
}

export function buildActionReport(plan: ActionPlan, items: ActionReportItem[]): ActionReport {
  return {
    id: reportId(),
    createdAt: new Date().toISOString(),
    projectId: plan.projectId,
    request: plan.request,
    dryRun: plan.dryRun,
    summary: {
      total: items.length,
      allowed: items.filter(item => item.decision.status === "allow" || item.decision.status === "allow_with_logging").length,
      approvalRequired: items.filter(item => item.decision.status === "approval_required").length,
      blocked: items.filter(item => item.decision.status === "blocked").length,
      executed: items.filter(item => item.executed).length
    },
    items
  };
}

export function writeActionReport(root: string, report: ActionReport) {
  const dir = path.join(root, "storage/governance/action-reports");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${report.id}.json`);
  const persisted = { ...report, reportPath: path.relative(root, file).replaceAll(path.sep, "/") };
  fs.writeFileSync(file, `${JSON.stringify(persisted, null, 2)}\n`);
  return persisted;
}
