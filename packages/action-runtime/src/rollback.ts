import type { ActionIntent } from "./action-intent.js";

export type RollbackPlan = {
  actionId: string;
  strategy: "none_needed" | "restore_previous_file" | "remove_created_path" | "manual_review_required";
  notes: string[];
};

export function rollbackPlanFor(action: ActionIntent): RollbackPlan {
  if (action.kind === "create_file" || action.kind === "create_folder") {
    return {
      actionId: action.id,
      strategy: "remove_created_path",
      notes: [`Remove ${action.target || "the created path"} if the action is later rejected.`]
    };
  }

  if (action.kind === "update_file" || action.kind === "delete_file") {
    return {
      actionId: action.id,
      strategy: "restore_previous_file",
      notes: ["Capture the original file content before execution and restore it if validation fails."]
    };
  }

  if (action.kind === "run_command") {
    return {
      actionId: action.id,
      strategy: "manual_review_required",
      notes: ["Commands must document expected side effects before execution."]
    };
  }

  return {
    actionId: action.id,
    strategy: "manual_review_required",
    notes: ["Rollback depends on the approved action scope."]
  };
}
