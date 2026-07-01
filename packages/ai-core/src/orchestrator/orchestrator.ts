import type { CouncilRequest, CouncilResponse } from "../../../shared/src/index.js";
import { ModelRouter } from "../../../ai-providers/src/index.js";
import { AgentRegistry } from "../agents/base/agent-registry.js";
import { getCouncil } from "../councils/council-registry.js";
import { CouncilSelector } from "./council-selector.js";
import { PolicyEngine } from "../guardrails/policy-engine.js";
import { TraceLogger } from "../tracing/trace-logger.js";

export class Orchestrator {
  private readonly selector = new CouncilSelector();
  private readonly agents = new AgentRegistry();
  private readonly modelRouter = new ModelRouter();
  private readonly policy = new PolicyEngine();
  private readonly traces = new TraceLogger();

  async run(request: CouncilRequest): Promise<CouncilResponse> {
    this.traces.log("request", request.input);
    const policyResult = this.policy.validate(request);
    const councilId = this.selector.select(request);
    const council = getCouncil(councilId);
    if (!council) throw new Error(`Council not found: ${councilId}`);

    const selectedAgents = this.agents.select(council.agents);
    const agentResults = await Promise.all(selectedAgents.map(a => a.run(request.input, { projectId: request.projectId, taskType: request.taskType })));
    const provider = this.modelRouter.selectProvider(request);
    const providerResponse = await provider.call({
      prompt: [`Council: ${council.id}`, `Agents: ${agentResults.map(r => r.agentId).join(", ")}`, `Request: ${request.input}`, `Agent summaries: ${agentResults.map(r => `${r.agentId}: ${r.summary}`).join("\n")}`].join("\n\n"),
      privacyLevel: request.privacyLevel ?? "local-only"
    });

    return {
      selectedCouncil: council.id,
      selectedProvider: provider.id,
      agentsUsed: agentResults.map(r => r.agentId),
      warnings: policyResult.warnings,
      answer: [`Selected council: ${council.id}`, `Selected provider: ${provider.id}`, "", "Agent recommendations:", ...agentResults.flatMap(r => r.recommendations.map(x => `- ${r.agentId}: ${x}`)), "", "Provider output:", providerResponse.text].join("\n")
    };
  }

  async runSingleAgent(request: CouncilRequest, agentId: string): Promise<CouncilResponse> {
    this.traces.log("agent-request", `${agentId}: ${request.input}`);
    const policyResult = this.policy.validate(request);
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);

    const agentResult = await agent.run(request.input, { projectId: request.projectId, taskType: request.taskType });
    const provider = this.modelRouter.selectProvider(request);
    const providerResponse = await provider.call({
      prompt: [`Single-agent mode`, `Agent: ${agent.id}`, `Request: ${request.input}`, `Summary: ${agentResult.summary}`, `Risks: ${agentResult.risks.join("; ")}`].join("\n\n"),
      privacyLevel: request.privacyLevel ?? "local-only"
    });

    return {
      selectedCouncil: "single-agent",
      selectedProvider: provider.id,
      agentsUsed: [agent.id],
      warnings: policyResult.warnings,
      answer: [`Selected council: single-agent`, `Selected provider: ${provider.id}`, `Selected agent: ${agent.id}`, "", "Agent summary:", agentResult.summary, "", "Agent recommendations:", ...agentResult.recommendations.map(x => `- ${x}`), "", "Provider output:", providerResponse.text].join("\n")
    };
  }
}
