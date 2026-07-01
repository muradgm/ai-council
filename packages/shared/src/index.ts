export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PrivacyLevel = "local-only" | "sanitized-external" | "external-allowed";
export interface CouncilRequest { input: string; projectId?: string; taskType?: string; riskLevel?: RiskLevel; privacyLevel?: PrivacyLevel; }
export interface CouncilResponse { answer: string; selectedCouncil: string; selectedProvider: string; agentsUsed: string[]; warnings: string[]; }
