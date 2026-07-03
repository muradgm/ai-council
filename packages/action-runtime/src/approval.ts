export type ActionApproval = {
  actionId: string;
  approved: true;
  approvedBy: string;
  scope: "low-risk-file-write" | "validation-command" | "manual";
  createdAt: string;
};

export function approvalFor(actionId: string, approvedBy = "human", scope: ActionApproval["scope"] = "manual"): ActionApproval {
  return {
    actionId,
    approved: true,
    approvedBy,
    scope,
    createdAt: new Date().toISOString()
  };
}

export function isApproved(actionId: string, approvals: ActionApproval[] = []) {
  return approvals.some(approval => approval.actionId === actionId && approval.approved);
}
