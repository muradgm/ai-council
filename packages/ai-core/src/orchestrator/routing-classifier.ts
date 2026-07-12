import type { CouncilRequest, RiskLevel } from "../../../shared/src/index.js";
import { parseAgentMentions, type AgentMentionParseResult } from "./agent-mention-parser.js";

export type RoutingTaskType =
  | "repo_review"
  | "security_review"
  | "architecture_review"
  | "ui_review"
  | "runtime_review"
  | "docs_review"
  | "feature_build"
  | "bug_fix"
  | "product_strategy"
  | "general";

export type RoutingConfidence = "high" | "medium" | "low";
export type RoutingSource = "mention" | "deterministic" | "schema-fallback";

export interface CouncilRouteDecision {
  taskType: RoutingTaskType;
  councilId: string;
  leadAgent: string;
  supportAgents: string[];
  confidence: RoutingConfidence;
  reason: string;
  requiredContext: string[];
  riskFlags: string[];
  source: RoutingSource;
  mention: AgentMentionParseResult;
}

export const MODEL_ROUTING_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["taskType", "leadAgent", "supportAgents", "confidence", "reason", "requiredContext"],
  properties: {
    taskType: {
      type: "string",
      enum: ["repo_review", "security_review", "architecture_review", "ui_review", "runtime_review", "docs_review", "feature_build", "bug_fix", "product_strategy", "general"]
    },
    leadAgent: { type: "string" },
    supportAgents: { type: "array", items: { type: "string" }, maxItems: 4 },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    reason: { type: "string" },
    requiredContext: { type: "array", items: { type: "string" }, maxItems: 8 },
    riskFlags: { type: "array", items: { type: "string" }, maxItems: 8 }
  }
} as const;

const VALID_TASK_TYPES = new Set<RoutingTaskType>([
  "repo_review",
  "security_review",
  "architecture_review",
  "ui_review",
  "runtime_review",
  "docs_review",
  "feature_build",
  "bug_fix",
  "product_strategy",
  "general"
]);

const VALID_CONFIDENCE = new Set<RoutingConfidence>(["high", "medium", "low"]);

function textFor(request: CouncilRequest) {
  return `${request.taskType || ""} ${request.projectId || ""} ${request.input}`.toLowerCase();
}

function inferTaskType(text: string): RoutingTaskType {
  if (/security|threat|vulnerability|secret|privacy|approval|permission|governance/.test(text)) return "security_review";
  if (/ui|ux|frontend|layout|screen|browser|visual|interaction|design/.test(text)) return "ui_review";
  if (/runtime|orchestrator|provider|model|event|agent|council|routing/.test(text)) return "runtime_review";
  if (/architecture|system|database|api|monorepo|boundary|scalability/.test(text)) return "architecture_review";
  if (/docs|documentation|readme|guide|manual/.test(text)) return "docs_review";
  if (/bug|debug|error|broken|fix|fails|failure/.test(text)) return "bug_fix";
  if (/feature|implement|build|add|create/.test(text)) return "feature_build";
  if (/product|roadmap|wedge|mvp|user|priorit/.test(text)) return "product_strategy";
  if (/repo|review|codebase|repository/.test(text)) return "repo_review";
  return "general";
}

function councilFor(taskType: RoutingTaskType, riskLevel?: RiskLevel) {
  if (riskLevel === "high" || riskLevel === "critical" || taskType === "security_review") return "security-council";
  if (taskType === "product_strategy" || taskType === "ui_review") return "product-council";
  if (taskType === "architecture_review" || taskType === "runtime_review") return "architecture-council";
  return "coding-council";
}

function defaultLeadFor(taskType: RoutingTaskType) {
  if (taskType === "security_review") return "security-architect";
  if (taskType === "ui_review" || taskType === "product_strategy") return "product-strategist";
  if (taskType === "runtime_review" || taskType === "architecture_review" || taskType === "repo_review") return "software-architect";
  if (taskType === "docs_review") return "final-synthesizer";
  if (taskType === "bug_fix") return "qa-engineer";
  return "software-architect";
}

function supportFor(taskType: RoutingTaskType, riskLevel?: RiskLevel) {
  const support = new Set<string>();
  if (taskType === "repo_review") ["qa-engineer", "security-architect", "final-synthesizer"].forEach(agent => support.add(agent));
  if (taskType === "security_review") ["software-architect", "backend-engineer", "qa-engineer", "final-synthesizer"].forEach(agent => support.add(agent));
  if (taskType === "runtime_review") ["ai-engineer", "security-architect", "qa-engineer", "final-synthesizer"].forEach(agent => support.add(agent));
  if (taskType === "architecture_review") ["database-architect", "devops-engineer", "security-architect", "final-synthesizer"].forEach(agent => support.add(agent));
  if (taskType === "ui_review") ["ux-strategist", "frontend-engineer", "software-architect", "final-synthesizer"].forEach(agent => support.add(agent));
  if (taskType === "docs_review") ["software-architect", "qa-engineer"].forEach(agent => support.add(agent));
  if (taskType === "feature_build") ["backend-engineer", "frontend-engineer", "qa-engineer", "final-synthesizer"].forEach(agent => support.add(agent));
  if (taskType === "bug_fix") ["software-architect", "backend-engineer", "final-synthesizer"].forEach(agent => support.add(agent));
  if (riskLevel === "high" || riskLevel === "critical") support.add("security-architect");
  return [...support].slice(0, 4);
}

function contextFor(taskType: RoutingTaskType) {
  const common = ["project-context", "recent-decisions"];
  const map: Record<RoutingTaskType, string[]> = {
    repo_review: ["repo-structure", "package-json", "tests", "runtime-files"],
    security_review: ["governance-files", "provider-routing", "tool-contracts", "env-handling"],
    architecture_review: ["architecture-docs", "package-map", "runtime-files", "dependency-boundaries"],
    ui_review: ["web-console-components", "styles", "browser-screenshots", "interaction-states"],
    runtime_review: ["orchestrator", "agent-registry", "provider-router", "response-events"],
    docs_review: ["readme", "operations-docs", "command-reference"],
    feature_build: ["target-files", "tests", "acceptance-criteria"],
    bug_fix: ["reproduction", "logs", "tests", "target-files"],
    product_strategy: ["project-purpose", "roadmap", "risks", "user-workflow"],
    general: ["repo-map", "project-context"]
  };
  return [...common, ...map[taskType]];
}

function riskFlagsFor(text: string, riskLevel?: RiskLevel) {
  const flags: string[] = [];
  if (riskLevel === "high" || riskLevel === "critical") flags.push(`request-risk:${riskLevel}`);
  if (/\.env|api[_-]?key|secret|token|password/.test(text)) flags.push("secret-sensitive");
  if (/delete|remove|rename|move/.test(text)) flags.push("filesystem-impact");
  if (/push|deploy|publish|release|github/.test(text)) flags.push("external-state-change");
  if (/\b(install|add package|npm install|pnpm add|yarn add|dependency change)\b/.test(text)) flags.push("dependency-change");
  return flags;
}

export function classifyCouncilRoute(request: CouncilRequest): CouncilRouteDecision {
  const mention = parseAgentMentions(request.input);
  const text = textFor(request);
  const taskType = inferTaskType(text);
  const councilId = councilFor(taskType, request.riskLevel);
  const explicitLead = mention.requestedLeadAgent;
  const defaultLead = defaultLeadFor(taskType);
  const leadAgent = explicitLead || defaultLead;
  const source: RoutingSource = explicitLead ? "mention" : "deterministic";
  const supportAgents = [
    ...(explicitLead && explicitLead !== defaultLead ? [defaultLead] : []),
    ...supportFor(taskType, request.riskLevel)
  ].filter(agent => agent !== leadAgent);
  const uniqueSupportAgents = [...new Set(supportAgents)].slice(0, 4);
  const requiredContext = contextFor(taskType);
  const riskFlags = riskFlagsFor(text, request.riskLevel);
  const confidence: RoutingConfidence = explicitLead || taskType !== "general" ? "high" : "low";
  const reason = explicitLead
    ? `User selected ${mention.requestedLeadLabel || leadAgent} with an explicit @agent mention; deterministic rules inferred ${taskType}.`
    : `Deterministic rules inferred ${taskType} from request language and risk level.`;

  return {
    taskType,
    councilId,
    leadAgent,
    supportAgents: uniqueSupportAgents,
    confidence,
    reason,
    requiredContext,
    riskFlags,
    source,
    mention
  };
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter(item => typeof item === "string").slice(0, 8) : [];
}

export function parseModelRouteJson(text: string): Omit<CouncilRouteDecision, "councilId" | "source" | "mention"> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const taskType = typeof parsed.taskType === "string" && VALID_TASK_TYPES.has(parsed.taskType as RoutingTaskType)
      ? parsed.taskType as RoutingTaskType
      : "general";
    const confidence = typeof parsed.confidence === "string" && VALID_CONFIDENCE.has(parsed.confidence as RoutingConfidence)
      ? parsed.confidence as RoutingConfidence
      : "low";
    const leadAgent = typeof parsed.leadAgent === "string" && parsed.leadAgent.trim() ? parsed.leadAgent : defaultLeadFor(taskType);
    const reason = typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason : "Model route parsed without a usable reason.";

    return {
      taskType,
      leadAgent,
      supportAgents: stringArray(parsed.supportAgents).filter(agent => agent !== leadAgent).slice(0, 4),
      confidence,
      reason,
      requiredContext: stringArray(parsed.requiredContext),
      riskFlags: stringArray(parsed.riskFlags)
    };
  } catch {
    return null;
  }
}
