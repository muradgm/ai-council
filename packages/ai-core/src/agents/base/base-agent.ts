import type { Agent, AgentContext, AgentResult } from "./agent-contract.js";

type AgentAnalysis = Partial<Omit<AgentResult, "agentId">> & Pick<AgentResult, "summary">;

export abstract class BaseAgent implements Agent {
  abstract id: string;
  abstract role: string;

  protected abstract analyze(input: string, context: AgentContext): Promise<AgentAnalysis>;

  async run(input: string, context: AgentContext): Promise<AgentResult> {
    const result = await this.analyze(input, context);
    const nextActions = result.nextActions || result.recommendations || [];
    return {
      agentId: this.id,
      summary: result.summary,
      findings: result.findings || [],
      risks: result.risks || [],
      uncertainties: result.uncertainties || [],
      nextActions,
      recommendations: result.recommendations || nextActions,
      confidence: typeof result.confidence === "number" ? Math.max(0, Math.min(1, result.confidence)) : 0.55
    };
  }
}
