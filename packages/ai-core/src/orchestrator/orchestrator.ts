import type { CouncilRequest, CouncilResponse, CouncilResponseEvent, CouncilResponseEventType } from "../../../shared/src/index.js";
import { ModelRouter } from "../../../ai-providers/src/index.js";
import type { ProviderResponse } from "../../../ai-providers/src/index.js";
import type { AgentResult } from "../agents/base/agent-contract.js";
import { AgentRegistry } from "../agents/base/agent-registry.js";
import { getCouncil } from "../councils/council-registry.js";
import { agentMentionHelp, parseAgentMentions } from "./agent-mention-parser.js";
import { CouncilSelector } from "./council-selector.js";
import { PolicyEngine } from "../guardrails/policy-engine.js";
import { TraceLogger } from "../tracing/trace-logger.js";

function titleize(id: string) {
  return id
    .split("-")
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function isUnavailableProvider(response: ProviderResponse) {
  return response.confidence <= 0 || /not available|not reachable|placeholder/i.test(response.text);
}

function compactAgentRead(agentResults: AgentResult[]) {
  return agentResults
    .filter(result => result.agentId !== "final-synthesizer")
    .slice(0, 5)
    .map(result => {
      const finding = result.findings[0];
      const evidence = finding?.evidence?.length ? ` Evidence: ${finding.evidence.join(", ")}.` : "";
      return `- ${titleize(result.agentId)}: ${finding?.claim || result.summary}${evidence}`;
    })
    .join("\n");
}

function severityRank(severity: string) {
  return ({ critical: 4, high: 3, medium: 2, low: 1 } as Record<string, number>)[severity] || 0;
}

function rankedFindings(agentResults: AgentResult[]) {
  return agentResults
    .flatMap(result => result.findings.map(finding => ({ agentId: result.agentId, ...finding })))
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, 6);
}

function consensusRead(agentResults: AgentResult[]) {
  const active = agentResults.filter(result => result.agentId !== "final-synthesizer");
  const withFindings = active.filter(result => result.findings.length > 0);
  const highRisk = rankedFindings(active).some(finding => finding.severity === "high" || finding.severity === "critical");
  return [
    `${withFindings.length}/${active.length} specialist agents returned structured findings.`,
    highRisk ? "At least one specialist sees high-risk work; treat the next action as approval/validation-sensitive." : "The specialists mostly point toward implementation hardening rather than more framework breadth.",
    "The Council output is now findings-first: claim, evidence, recommendation, uncertainty, and next action."
  ].join(" ");
}

function findingsBlock(agentResults: AgentResult[]) {
  const findings = rankedFindings(agentResults);
  if (!findings.length) return "- No structured findings returned by the selected agents.";
  return findings.map((finding, index) => [
    `${index + 1}. [${finding.severity.toUpperCase()}] ${titleize(finding.agentId)}: ${finding.claim}`,
    finding.evidence.length ? `   Evidence: ${finding.evidence.join(", ")}` : "   Evidence: request",
    `   Recommendation: ${finding.recommendation}`
  ].join("\n")).join("\n");
}

function uncertaintyBlock(agentResults: AgentResult[]) {
  const uncertainties = agentResults
    .flatMap(result => result.uncertainties.map(item => `${titleize(result.agentId)}: ${item}`))
    .slice(0, 6);
  return uncertainties.length ? uncertainties.map(item => `- ${item}`).join("\n") : "- No explicit uncertainty surfaced.";
}

function nextActionBlock(agentResults: AgentResult[]) {
  const actions = agentResults
    .flatMap(result => result.nextActions.map(item => ({ agentId: result.agentId, item })))
    .slice(0, 5);
  return actions.length ? actions.map((action, index) => `${index + 1}. ${action.item} (${titleize(action.agentId)})`).join("\n") : "1. Confirm scope, make one testable change, then run validation.";
}

function firstNextAction(agentResults: AgentResult[]) {
  return agentResults.flatMap(result => result.nextActions).find(Boolean);
}

function responseEvent(
  type: CouncilResponseEventType,
  label: string,
  detail: string,
  status: CouncilResponseEvent["status"],
  tone: CouncilResponseEvent["tone"],
  createdAt: string
): CouncilResponseEvent {
  return {
    id: `${type}-${createdAt}`,
    type,
    label,
    detail,
    status,
    tone,
    createdAt
  };
}

function buildResponseEvents(params: {
  request: CouncilRequest;
  selectedCouncil: string;
  selectedProvider: string;
  agentsUsed: string[];
  agentResults: AgentResult[];
  warnings: string[];
  requestedLeadLabel?: string;
}): CouncilResponseEvent[] {
  const { request, selectedCouncil, selectedProvider, agentsUsed, agentResults, warnings, requestedLeadLabel } = params;
  const createdAt = new Date().toISOString();
  const findingCount = rankedFindings(agentResults).length;
  const action = firstNextAction(agentResults);
  const project = request.projectId || "General";
  const leadNote = requestedLeadLabel ? `Explicit @agent lead: ${requestedLeadLabel}. ` : "";

  return [
    responseEvent("context_read", "Context loaded", `Loaded ${project} context, task type ${request.taskType || "unspecified"}, and ${request.privacyLevel || "local-only"} privacy policy.`, "complete", "blue", createdAt),
    responseEvent("agent_started", "Agents routed", `${leadNote}Selected ${selectedCouncil} with ${agentsUsed.join(", ") || "no agents"} via ${selectedProvider}.`, "complete", "violet", createdAt),
    responseEvent("agent_finding_added", "Findings collected", findingCount ? `${findingCount} structured findings were returned by the selected agents.` : "No structured findings were returned; answer falls back to scoped synthesis.", findingCount ? "complete" : "skipped", "teal", createdAt),
    responseEvent("risk_detected", "Risk checked", warnings.length ? warnings.join(" ") : "No policy warnings were returned by the guardrail pass.", warnings.length ? "complete" : "skipped", "warn", createdAt),
    responseEvent("action_proposed", "Action proposed", action || "No explicit action was proposed; final answer recommends the smallest useful next move.", action ? "complete" : "skipped", "teal", createdAt),
    responseEvent("approval_required", "Approval gate", warnings.length ? "Warnings are present; review before high-impact changes." : "No external action approval was required for this answer.", warnings.length ? "complete" : "skipped", "warn", createdAt),
    responseEvent("validation_running", "Response validated", "Response was shaped into Council sections with evidence, risks, uncertainty, and next move.", "complete", "blue", createdAt),
    responseEvent("final_answer_streamed", "Final answer ready", "Final synthesis is ready for the conversation.", "complete", "violet", createdAt)
  ];
}

function agentEvidenceForPrompt(agentResults: AgentResult[]) {
  return agentResults.map(result => {
    const findings = result.findings.slice(0, 2).map(finding => [
      `- ${finding.severity}: ${finding.claim}`,
      `  Evidence: ${finding.evidence.length ? finding.evidence.join(", ") : "request"}`,
      `  Recommendation: ${finding.recommendation}`
    ].join("\n")).join("\n");
    const uncertainty = result.uncertainties.slice(0, 2).join("; ");
    return [
      `${result.agentId}: ${result.summary}`,
      findings || "- No structured finding.",
      uncertainty ? `Uncertainty: ${uncertainty}` : ""
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}

function strongestMove(request: CouncilRequest, councilId: string) {
  const project = request.projectId ? ` for ${request.projectId}` : "";
  const text = request.input.toLowerCase();
  if (/intelligent|useful|response|language|human|robot/.test(text)) {
    return "The highest-leverage improvement is the context-aware answer loop: read the right project context, form a concrete judgement, expose uncertainty, and recommend one next move in plain human language.";
  }
  if (/github|public|push|repo/.test(text)) {
    return "I would treat this as release-readiness work: keep private artifacts out of Git, prove the gates are green, then push only the intentional source and docs.";
  }
  if (councilId.includes("architecture")) return `I would slow down just enough to make the architecture decision explicit${project}, then validate it with one small implementation slice.`;
  if (councilId.includes("security")) return `I would treat this as a risk decision first${project}: define the sensitive assets, tighten the boundary, then test the control.`;
  if (councilId.includes("product")) return `I would anchor this in the user workflow${project}: pick the painful moment, define the outcome, and cut anything that does not help that moment.`;
  return `I would make the next step small and verifiable${project}: change the smallest surface that proves the idea, then run the gates.`;
}

function contextualRead(request: CouncilRequest, agentResults: AgentResult[]) {
  const text = request.input.toLowerCase();
  if (/intelligent|useful|response|language|human|robot/.test(text)) {
    return [
      "- The weak point is response quality: the system can route and validate, but the fallback answer still needs richer synthesis.",
      "- The next useful upgrade is project-aware answer composition: cite loaded context, name the tradeoff, and make one recommendation.",
      "- The UI should support that behavior by feeling like a working conversation, not a catalog dashboard.",
      "- Model status must stay honest: if Ollama is missing, say so, then give the best local deterministic read instead of pretending."
    ].join("\n");
  }
  if (/github|public|push|repo/.test(text)) {
    return [
      "- The repo has a real validation foundation, but public readiness depends on keeping generated memory and traces out of Git.",
      "- Secrets posture matters more than cosmetic polish before the first remote push.",
      "- The first commit should be boring and auditable: source, docs, config examples, and empty storage scaffolds only."
    ].join("\n");
  }
  return compactAgentRead(agentResults) || "- The request is broad enough that the safest move is to clarify scope, then execute one testable slice.";
}

function buildCouncilAnswer(params: {
  request: CouncilRequest;
  councilId: string;
  providerId: string;
  agentResults: AgentResult[];
  providerResponse: ProviderResponse;
  warnings: string[];
}) {
  const { request, councilId, providerId, agentResults, providerResponse, warnings } = params;
  const unavailable = isUnavailableProvider(providerResponse);
  const modelSection = unavailable
    ? [
        "The local model route did not produce useful synthesis.",
        `The local model route selected ${providerId}, but it did not produce a useful model-backed synthesis. I am using the Council's local routing and agent analysis instead.`,
        providerResponse.text
      ].join("\n")
    : providerResponse.text;
  const evidence = [
    `Selected council: ${councilId}`,
    `Selected provider: ${providerId}`,
    `Agents used: ${agentResults.map(result => result.agentId).join(", ")}`,
    `Structured findings: ${rankedFindings(agentResults).length}`,
    request.projectId ? `Project context: ${request.projectId}` : "Project context: General",
    `Privacy: ${request.privacyLevel || "local-only"}`,
    `Risk: ${request.riskLevel || "medium"}`
  ].join("\n");

  return [
    "Read:",
    strongestMove(request, councilId),
    "",
    "Why it matters:",
    [contextualRead(request, agentResults), "", `Council consensus: ${consensusRead(agentResults)}`].join("\n"),
    "",
    "Findings:",
    findingsBlock(agentResults),
    "",
    "Next move:",
    nextActionBlock(agentResults),
    "",
    "Risks:",
    warnings.length ? warnings.map(warning => `- ${warning}`).join("\n") : "- No policy warnings from the local guardrail pass.\n- The answer should still be checked against source files before high-impact changes.",
    "",
    "Uncertainty:",
    uncertaintyBlock(agentResults),
    "",
    "Model synthesis:",
    modelSection,
    "",
    "Evidence:",
    evidence,
    "",
    "Trace:",
    `Selected council: ${councilId}`
  ].join("\n");
}

function buildSingleAgentAnswer(params: {
  request: CouncilRequest;
  agentId: string;
  agentResult: AgentResult;
  providerId: string;
  providerResponse: ProviderResponse;
  warnings: string[];
}) {
  const { agentId, agentResult, providerId, providerResponse, warnings } = params;
  const unavailable = isUnavailableProvider(providerResponse);
  const recommendations = agentResult.recommendations
    .filter(item => !/^Review request from/i.test(item))
    .slice(0, 4);

  return [
    "Read:",
    agentResult.summary,
    "",
    "Why it matters:",
    `This answer is intentionally scoped to ${titleize(agentId)} rather than the full Council, so it should be treated as a specialist read.`,
    "",
    "Next move:",
    ...(recommendations.length ? recommendations.map((item, index) => `${index + 1}. ${item}`) : [
      "1. Make the decision explicit.",
      "2. Keep the next change small enough to validate.",
      "3. Run the relevant tests or Council gates before calling it done."
    ]),
    "",
    "Risks:",
    agentResult.risks.length ? agentResult.risks.map(risk => `- ${risk}`).join("\n") : "- No role-specific risk surfaced.",
    "",
    warnings.length ? warnings.map(warning => `- ${warning}`).join("\n") : "- No policy warnings from the local guardrail pass.",
    "",
    "Model synthesis:",
    unavailable ? providerResponse.text : providerResponse.text,
    "",
    "Evidence:",
    "Selected council: single-agent",
    `Selected provider: ${providerId}`,
    `Selected agent: ${agentId}`,
    "",
    "Trace:",
    "Selected council: single-agent"
  ].join("\n");
}

function buildMentionControlResponse(intent: "help" | "list-agents"): CouncilResponse {
  const createdAt = new Date().toISOString();
  const intro = intent === "help"
    ? "Use an @agent mention at the start or anywhere in the prompt to select the lead specialist. The orchestrator still owns context loading, support-agent routing, governance, validation, and final synthesis."
    : "Available deterministic @agent mentions:";
  const answer = [
    "Read:",
    intro,
    "",
    "Available mentions:",
    agentMentionHelp(),
    "",
    "Examples:",
    "@stl review this repo and recommend the next move.",
    "@sec review provider routing and approval gates.",
    "@qa check validation coverage for the runtime loop.",
    "",
    "Trace:",
    `Mention control: ${intent}`
  ].join("\n");

  return {
    selectedCouncil: "mention-help",
    selectedProvider: "local-rule",
    agentsUsed: [],
    warnings: [],
    answer,
    events: [
      responseEvent("context_read", "Mention help loaded", "Loaded the deterministic @agent mention registry.", "complete", "blue", createdAt),
      responseEvent("final_answer_streamed", "Mention help ready", "Returned local mention help without model routing.", "complete", "violet", createdAt)
    ]
  };
}

function orderAgentsWithRequestedLead(agentIds: string[], requestedLeadAgent?: string) {
  if (!requestedLeadAgent) return agentIds;
  return [requestedLeadAgent, ...agentIds.filter(agentId => agentId !== requestedLeadAgent)];
}

export class Orchestrator {
  private readonly selector = new CouncilSelector();
  private readonly agents = new AgentRegistry();
  private readonly modelRouter = new ModelRouter();
  private readonly policy = new PolicyEngine();
  private readonly traces = new TraceLogger();

  async run(request: CouncilRequest): Promise<CouncilResponse> {
    this.traces.log("request", request.input);
    const mentionRoute = parseAgentMentions(request.input);
    if (mentionRoute.controlIntent) return buildMentionControlResponse(mentionRoute.controlIntent);

    const policyResult = this.policy.validate(request);
    const mentionWarnings = mentionRoute.unknownTokens.length
      ? [`Unknown @agent mention ignored: ${mentionRoute.unknownTokens.join(", ")}. Use @help for supported mentions.`]
      : [];
    const warnings = [...policyResult.warnings, ...mentionWarnings];
    const councilId = this.selector.select(request);
    const council = getCouncil(councilId);
    if (!council) throw new Error(`Council not found: ${councilId}`);

    const requestedLeadAgent = mentionRoute.requestedLeadAgent && this.agents.get(mentionRoute.requestedLeadAgent)
      ? mentionRoute.requestedLeadAgent
      : undefined;
    const selectedAgents = this.agents.select(orderAgentsWithRequestedLead(council.agents, requestedLeadAgent));
    const agentResults = await Promise.all(selectedAgents.map(a => a.run(request.input, { projectId: request.projectId, taskType: request.taskType, privacyLevel: request.privacyLevel, riskLevel: request.riskLevel })));
    const provider = this.modelRouter.selectProvider(request);
    const providerResponse = await provider.call({
      prompt: [
        "You are AI Council, a local-first senior technical partner. Answer with judgement, not generic assistant filler.",
        "Be natural, specific, and context-aware. Name what you inferred, what is uncertain, and the next move.",
        "Use this structure in spirit: Read, Why it matters, Next move, Risks, Evidence. Do not over-explain.",
        `Council: ${council.id}`,
        `Project: ${request.projectId || "General"}`,
        `Task type: ${request.taskType || "unspecified"}`,
        `Risk: ${request.riskLevel || "medium"}`,
        `Agents: ${agentResults.map(r => r.agentId).join(", ")}`,
        `Request: ${request.input}`,
        `Agent findings and evidence:\n${agentEvidenceForPrompt(agentResults)}`
      ].join("\n\n"),
      privacyLevel: request.privacyLevel ?? "local-only",
      riskLevel: request.riskLevel,
      taskType: request.taskType,
      allowNetwork: request.privacyLevel !== undefined && request.privacyLevel !== "local-only"
    });

    const agentsUsed = agentResults.map(r => r.agentId);
    return {
      selectedCouncil: council.id,
      selectedProvider: provider.id,
      agentsUsed,
      warnings,
      answer: buildCouncilAnswer({ request, councilId: council.id, providerId: provider.id, agentResults, providerResponse, warnings }),
      events: buildResponseEvents({
        request,
        selectedCouncil: council.id,
        selectedProvider: provider.id,
        agentsUsed,
        agentResults,
        warnings,
        requestedLeadLabel: requestedLeadAgent ? mentionRoute.requestedLeadLabel : undefined
      })
    };
  }

  async runSingleAgent(request: CouncilRequest, agentId: string): Promise<CouncilResponse> {
    this.traces.log("agent-request", `${agentId}: ${request.input}`);
    const policyResult = this.policy.validate(request);
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);

    const agentResult = await agent.run(request.input, { projectId: request.projectId, taskType: request.taskType, privacyLevel: request.privacyLevel, riskLevel: request.riskLevel });
    const provider = this.modelRouter.selectProvider(request);
    const providerResponse = await provider.call({
      prompt: [
        "You are a specialist inside AI Council. Answer like a senior expert: direct, contextual, and practical.",
        "Use this structure in spirit: Read, Why it matters, Next move, Risks, Evidence.",
        `Single-agent mode`,
        `Project: ${request.projectId || "General"}`,
        `Agent: ${agent.id}`,
        `Request: ${request.input}`,
        `Summary: ${agentResult.summary}`,
        `Risks: ${agentResult.risks.join("; ")}`
      ].join("\n\n"),
      privacyLevel: request.privacyLevel ?? "local-only",
      riskLevel: request.riskLevel,
      taskType: request.taskType,
      allowNetwork: request.privacyLevel !== undefined && request.privacyLevel !== "local-only"
    });

    const agentsUsed = [agent.id];
    return {
      selectedCouncil: "single-agent",
      selectedProvider: provider.id,
      agentsUsed,
      warnings: policyResult.warnings,
      answer: buildSingleAgentAnswer({ request, agentId: agent.id, agentResult, providerId: provider.id, providerResponse, warnings: policyResult.warnings }),
      events: buildResponseEvents({
        request,
        selectedCouncil: "single-agent",
        selectedProvider: provider.id,
        agentsUsed,
        agentResults: [agentResult],
        warnings: policyResult.warnings
      })
    };
  }
}
