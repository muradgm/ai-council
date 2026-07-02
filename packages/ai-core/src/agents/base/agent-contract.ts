import type { PrivacyLevel, RiskLevel } from "../../../../shared/src/index.js";

export type AgentFindingSeverity = "low" | "medium" | "high" | "critical";

export interface AgentFinding {
  severity: AgentFindingSeverity;
  claim: string;
  evidence: string[];
  recommendation: string;
}

export interface AgentContext {
  projectId?: string;
  taskType?: string;
  privacyLevel?: PrivacyLevel;
  riskLevel?: RiskLevel;
}

export interface AgentResult {
  agentId: string;
  summary: string;
  findings: AgentFinding[];
  risks: string[];
  uncertainties: string[];
  nextActions: string[];
  recommendations: string[];
  confidence: number;
}

export interface Agent { id: string; role: string; run(input: string, context: AgentContext): Promise<AgentResult>; }
