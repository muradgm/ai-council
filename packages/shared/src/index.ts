export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PrivacyLevel = "local-only" | "sanitized-external" | "external-allowed";
export interface CouncilRequest { input: string; projectId?: string; taskType?: string; riskLevel?: RiskLevel; privacyLevel?: PrivacyLevel; }
export type CouncilResponseEventType =
  | "agent_started"
  | "context_read"
  | "agent_finding_added"
  | "risk_detected"
  | "action_proposed"
  | "approval_required"
  | "validation_running"
  | "final_answer_streamed";
export type CouncilResponseEventStatus = "pending" | "active" | "complete" | "blocked" | "skipped";
export interface CouncilResponseEvent {
  id: string;
  type: CouncilResponseEventType;
  label: string;
  detail: string;
  status: CouncilResponseEventStatus;
  tone: "teal" | "blue" | "violet" | "warn" | "danger";
  createdAt: string;
}
export interface CouncilResponse { answer: string; selectedCouncil: string; selectedProvider: string; agentsUsed: string[]; warnings: string[]; events?: CouncilResponseEvent[]; }
