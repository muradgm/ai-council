export interface AgentContext { projectId?: string; taskType?: string; }
export interface AgentResult { agentId: string; summary: string; risks: string[]; recommendations: string[]; }
export interface Agent { id: string; role: string; run(input: string, context: AgentContext): Promise<AgentResult>; }
