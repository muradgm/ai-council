import type { ActionDecisionStatus, ActionIntent, ActionRiskLevel } from "./action-intent.js";
import { isAllowedValidationCommand } from "./command-allowlist.js";

export type GovernanceDecision = {
  actionId: string;
  status: ActionDecisionStatus;
  riskLevel: ActionRiskLevel;
  approvalRequired: boolean;
  reasons: string[];
};

const secretPattern = /\.env|api[_ -]?key|secret|token|password|private key/i;
const sourcePattern = /^(apps|packages|scripts|tests|projects)\//;
const destructiveCommand = /\b(rm|del|remove-item|format|reset --hard|clean -fd|drop|truncate)\b/i;
const publishCommand = /\b(git push|deploy|vercel|publish|release)\b/i;
const installCommand = /\b(pnpm add|npm install|yarn add|bun add|pip install|winget install)\b/i;

function targetText(action: ActionIntent) {
  return [action.description, action.target, action.command, action.args?.join(" "), action.reason].filter(Boolean).join(" ");
}

function decision(status: ActionDecisionStatus, riskLevel: ActionRiskLevel, actionId: string, reasons: string[]): GovernanceDecision {
  return {
    actionId,
    status,
    riskLevel,
    approvalRequired: status === "approval_required",
    reasons
  };
}

export function decideAction(action: ActionIntent): GovernanceDecision {
  const text = targetText(action);

  if (secretPattern.test(text)) {
    return decision("blocked", "critical", action.id, ["Secret-bearing actions are blocked by default."]);
  }

  if (action.kind === "delete_file") {
    return decision("approval_required", "high", action.id, ["File deletion is destructive and requires scoped approval plus rollback plan."]);
  }

  if (action.kind === "install_package") {
    return decision("approval_required", "high", action.id, ["Dependency installation changes supply-chain and lockfile state."]);
  }

  if (action.kind === "publish" || action.kind === "use_external_provider") {
    return decision("approval_required", "high", action.id, ["External state or data-sharing actions require explicit approval."]);
  }

  if (action.kind === "run_command") {
    const command = action.command || "";
    if (destructiveCommand.test(command)) {
      return decision("blocked", "critical", action.id, ["Destructive shell commands are blocked by the dry-run action runtime."]);
    }
    if (installCommand.test(command) || publishCommand.test(command)) {
      return decision("approval_required", "high", action.id, ["Command changes external, dependency, or release state."]);
    }
    if (isAllowedValidationCommand(command)) {
      return decision("allow_with_logging", "low", action.id, ["Validation command is allowed with audit logging."]);
    }
    return decision("approval_required", "medium", action.id, ["Unrecognized commands require approval before execution."]);
  }

  if (action.kind === "update_file") {
    const target = action.target || "";
    if (sourcePattern.test(target) || /source|code/i.test(text)) {
      return decision("approval_required", "medium", action.id, ["Source edits require approval in the governed runtime."]);
    }
    return decision("allow_with_logging", "medium", action.id, ["File update is allowed only with audit logging and rollback metadata."]);
  }

  if (action.kind === "create_file") {
    const target = action.target || "";
    if (sourcePattern.test(target)) {
      return decision("approval_required", "medium", action.id, ["Creating source files requires approval."]);
    }
    return decision("allow_with_logging", "low", action.id, ["Creating review artifacts is low risk but should be logged."]);
  }

  if (action.kind === "create_folder") {
    return decision("allow_with_logging", "low", action.id, ["Folder creation is low risk when scoped to the workspace."]);
  }

  return decision("approval_required", "medium", action.id, ["Unknown action kind requires approval."]);
}
