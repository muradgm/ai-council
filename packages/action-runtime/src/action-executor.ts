import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import type { ActionPlan } from "./action-intent.js";
import type { ActionApproval } from "./approval.js";
import { isApproved } from "./approval.js";
import { buildActionReport, type ActionReport, type ActionReportItem, writeActionReport } from "./action-report.js";
import { createFileBackup } from "./backup.js";
import { isAllowedValidationCommand } from "./command-allowlist.js";
import { decideAction } from "./governance-decision.js";
import { rollbackPlanFor } from "./rollback.js";

export type ExecuteActionPlanOptions = {
  root?: string;
  writeReport?: boolean;
  approvals?: ActionApproval[];
};

const sourcePath = /^(apps|packages|scripts|tests|projects)\//;
const markdownPath = /\.md$/i;
const safeArtifactPath = /^(storage\/governance\/action-plans|storage\/governance\/reports|docs)\//;

function skippedReason(dryRun: boolean, status: string, approved: boolean) {
  if (dryRun) return "Dry-run mode: no filesystem, command, dependency, or external action was executed.";
  if (status === "blocked") return "Blocked by governance decision.";
  if (status === "approval_required") return "Approval is required before execution.";
  if (!approved) return "Execution approval is required for this action id.";
  return "Action kind is outside the approved low-risk execution slice.";
}

function canExecuteFileWrite(target = "") {
  return markdownPath.test(target) && safeArtifactPath.test(target) && !sourcePath.test(target);
}

function ensureInsideRoot(root: string, rel: string) {
  const full = path.resolve(root, rel);
  const resolvedRoot = path.resolve(root);
  if (full !== resolvedRoot && !full.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Action target escapes workspace root: ${rel}`);
  }
  return full;
}

function executeFileAction(plan: ActionPlan, kind: string, root: string, target: string, content: string) {
  if (!canExecuteFileWrite(target)) {
    return { executed: false, skippedReason: "Only approved non-source Markdown artifacts can be written by this runtime slice." };
  }

  const full = ensureInsideRoot(root, target);
  if (kind === "create_file" && fs.existsSync(full)) {
    return { executed: false, skippedReason: "Create file action refused to overwrite an existing path." };
  }
  const backupPath = createFileBackup(root, target, plan.id);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return {
    executed: true,
    skippedReason: "",
    backupPath,
    result: { ok: true, stdout: `Wrote ${target}` }
  };
}

function executeValidationCommand(root: string, command: string) {
  if (!isAllowedValidationCommand(command)) {
    return { executed: false, skippedReason: "Command is not in the explicit validation allowlist." };
  }

  const [cmd, ...args] = command.split(/\s+/);
  const result = spawnSync(cmd, args, { cwd: root, encoding: "utf8", shell: process.platform === "win32" });
  return {
    executed: true,
    skippedReason: "",
    result: {
      ok: result.status === 0,
      status: result.status,
      stdout: (result.stdout || "").trim().slice(0, 4000),
      stderr: (result.stderr || result.error?.message || "").trim().slice(0, 4000)
    }
  };
}

export function executeActionPlan(plan: ActionPlan, options: ExecuteActionPlanOptions = {}): ActionReport {
  const root = options.root || process.cwd();
  const items: ActionReportItem[] = plan.actions.map(action => {
    const decision = decideAction(action);
    const rollback = rollbackPlanFor(action);
    const approved = isApproved(action.id, options.approvals);
    let execution: Partial<ActionReportItem> = {};

    if (!plan.dryRun && decision.status !== "blocked" && approved) {
      if ((action.kind === "create_file" || action.kind === "update_file") && action.target && action.contentPreview) {
        execution = executeFileAction(plan, action.kind, root, action.target, action.contentPreview);
      } else if (action.kind === "run_command" && action.command) {
        execution = executeValidationCommand(root, action.command);
      }
    }

    const executed = execution.executed === true;
    return {
      actionId: action.id,
      kind: action.kind,
      description: action.description,
      target: action.target,
      command: action.command,
      decision,
      rollback,
      executed,
      skippedReason: executed ? "" : execution.skippedReason || skippedReason(plan.dryRun, decision.status, approved),
      backupPath: execution.backupPath,
      result: execution.result
    };
  });

  const report = buildActionReport(plan, items);
  if (options.writeReport === false) return report;
  return writeActionReport(root, report);
}
