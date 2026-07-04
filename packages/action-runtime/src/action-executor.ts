import type { ActionPlan } from "./action-intent.js";
import { buildActionReport, type ActionReport, type ActionReportItem, writeActionReport } from "./action-report.js";
import { decideAction } from "./governance-decision.js";
import { rollbackPlanFor } from "./rollback.js";

export type ExecuteActionPlanOptions = {
  root?: string;
  writeReport?: boolean;
};

function skippedReason(dryRun: boolean, status: string) {
  if (dryRun) return "Dry-run mode: no filesystem, command, dependency, or external action was executed.";
  if (status === "blocked") return "Blocked by governance decision.";
  if (status === "approval_required") return "Approval is required before execution.";
  return "Execution is not enabled in this first action-runtime slice.";
}

export function executeActionPlan(plan: ActionPlan, options: ExecuteActionPlanOptions = {}): ActionReport {
  const items: ActionReportItem[] = plan.actions.map(action => {
    const decision = decideAction(action);
    const rollback = rollbackPlanFor(action);
    return {
      actionId: action.id,
      kind: action.kind,
      description: action.description,
      target: action.target,
      command: action.command,
      decision,
      rollback,
      executed: false,
      skippedReason: skippedReason(plan.dryRun, decision.status)
    };
  });

  const report = buildActionReport(plan, items);
  if (options.writeReport === false) return report;
  return writeActionReport(options.root || process.cwd(), report);
}
