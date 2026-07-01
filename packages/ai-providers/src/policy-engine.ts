import type { ProviderRequest } from "./provider-interface.js";

export class PolicyEngine {
  requiresHumanApproval(request: ProviderRequest): boolean {
    if (request.privacyLevel === "local-only" && request.allowNetwork) return true;
    if ((request.riskLevel === "high" || request.riskLevel === "critical") && request.taskType?.includes("trading")) return true;
    if ((request.maxCostUsd ?? 0) > 1) return true;
    return false;
  }

  explain(request: ProviderRequest): string[] {
    const notes: string[] = [];
    notes.push(`privacy=${request.privacyLevel}`);
    if (request.riskLevel) notes.push(`risk=${request.riskLevel}`);
    if (request.taskType) notes.push(`taskType=${request.taskType}`);
    if (this.requiresHumanApproval(request)) notes.push("human approval required before execution");
    return notes;
  }
}
