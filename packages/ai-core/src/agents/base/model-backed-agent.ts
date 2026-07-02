import fs from "node:fs";
import path from "node:path";
import { ModelRouter } from "../../../../ai-providers/src/index.js";
import type { ProviderResponse } from "../../../../ai-providers/src/index.js";
import { BaseAgent } from "./base-agent.js";
import type { AgentContext, AgentFinding, AgentResult } from "./agent-contract.js";
import { parseAgentResultJson } from "./agent-result-schema.js";

type ModelBackedAgentOptions = {
  id: string;
  role: string;
  instructionPath: string;
  focus: string[];
};

function readTextIfExists(rel: string) {
  const full = path.join(process.cwd(), rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function evidencePaths(input: string) {
  return Array.from(input.matchAll(/Source:\s+([^\n]+)/g))
    .map(match => match[1]?.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function sentence(input: string, fallback: string) {
  const trimmed = input.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, 220) : fallback;
}

function providerUnavailable(response: ProviderResponse) {
  return response.confidence <= 0 || /blocked|not configured|not available|not reachable|returned no text|placeholder/i.test(response.text);
}

function fallbackFinding(agentId: string, input: string, paths: string[], focus: string[]): AgentFinding {
  const evidence = paths.length ? paths.slice(0, 3) : ["request"];
  const focusText = focus.slice(0, 2).join(" and ");
  if (agentId === "security-architect") {
    return {
      severity: /\.env|api[_-]?key|secret|token|password|external provider|delete|deploy/i.test(input) ? "high" : "medium",
      claim: "The request needs an explicit privacy and permission boundary before execution.",
      evidence,
      recommendation: "Keep private repo context local-only, require approval before external provider/tool actions, and run the secrets/governance gates."
    };
  }
  if (agentId === "qa-engineer") {
    return {
      severity: "medium",
      claim: "The current validation can pass without proving behavior quality.",
      evidence,
      recommendation: "Add a behavior eval that seeds a concrete failure and requires the Council to identify it with file-grounded evidence."
    };
  }
  if (agentId === "final-synthesizer") {
    return {
      severity: "medium",
      claim: "The Council needs consensus, dissent, and one selected next action rather than parallel role summaries.",
      evidence,
      recommendation: "Synthesize agent findings by severity, evidence strength, disagreement, and validation path."
    };
  }
  return {
    severity: "medium",
    claim: `The strongest improvement is to turn ${focusText || "agent analysis"} into a repeatable executable path.`,
    evidence,
    recommendation: "Implement one narrow repo-review loop with structured agent output, file citations, and behavioral validation before adding more framework layers."
  };
}

function fallbackResult(agentId: string, role: string, focus: string[], input: string, context: AgentContext, reason: string): AgentResult {
  const paths = evidencePaths(input);
  const finding = fallbackFinding(agentId, input, paths, focus);
  return {
    agentId,
    summary: `${role} read: ${sentence(finding.claim, "The request needs grounded specialist analysis.")}`,
    findings: [finding],
    risks: [
      "Model-backed analysis was unavailable or unstructured, so this result uses deterministic local fallback logic.",
      context.privacyLevel === "local-only" ? "Private context must remain local unless explicitly sanitized and approved." : "External routing should still be checked against governance policy."
    ],
    uncertainties: paths.length ? ["Only the loaded context snippets were considered; unindexed files may change the conclusion."] : ["No explicit source paths were loaded for this request."],
    nextActions: [finding.recommendation],
    recommendations: [finding.recommendation],
    confidence: reason ? 0.58 : 0.68
  };
}

export class ModelBackedAgent extends BaseAgent {
  id: string;
  role: string;
  private readonly instructionPath: string;
  private readonly focus: string[];
  private readonly modelRouter = new ModelRouter();

  constructor(options: ModelBackedAgentOptions) {
    super();
    this.id = options.id;
    this.role = options.role;
    this.instructionPath = options.instructionPath;
    this.focus = options.focus;
  }

  protected async analyze(input: string, context: AgentContext): Promise<Omit<AgentResult, "agentId">> {
    const instructions = readTextIfExists(this.instructionPath);
    const provider = this.modelRouter.selectProvider({
      input,
      projectId: context.projectId,
      taskType: context.taskType,
      privacyLevel: context.privacyLevel || "local-only",
      riskLevel: context.riskLevel
    });

    const prompt = [
      `You are ${this.role} inside AI Council.`,
      "Return only valid JSON with this shape:",
      "{\"summary\":\"string\",\"findings\":[{\"severity\":\"low|medium|high|critical\",\"claim\":\"string\",\"evidence\":[\"loaded path or request\"],\"recommendation\":\"string\"}],\"risks\":[\"string\"],\"uncertainties\":[\"string\"],\"nextActions\":[\"string\"],\"recommendations\":[\"string\"],\"confidence\":0.0}",
      "Rules:",
      "- Use only the request and loaded context provided.",
      "- Cite only paths present after `Source:` lines, or use `request` when no path is loaded.",
      "- Identify uncertainty instead of inventing facts.",
      "- Keep findings practical and implementation-oriented.",
      `Focus: ${this.focus.join(", ")}`,
      `Instructions:\n${instructions || "No additional instruction file found."}`,
      `Project: ${context.projectId || "General"}`,
      `Task type: ${context.taskType || "unspecified"}`,
      `Privacy: ${context.privacyLevel || "local-only"}`,
      `Risk: ${context.riskLevel || "medium"}`,
      `Request and context:\n${input}`
    ].join("\n\n");

    const providerResponse = await provider.call({
      prompt,
      privacyLevel: context.privacyLevel || "local-only",
      riskLevel: context.riskLevel,
      taskType: context.taskType,
      allowNetwork: context.privacyLevel !== undefined && context.privacyLevel !== "local-only"
    });

    if (!providerUnavailable(providerResponse)) {
      const parsed = parseAgentResultJson(this.id, providerResponse.text);
      if (parsed) return parsed;
    }

    return fallbackResult(this.id, this.role, this.focus, input, context, providerResponse.text);
  }
}
