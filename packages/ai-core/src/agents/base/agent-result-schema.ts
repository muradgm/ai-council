import type { AgentFinding, AgentFindingSeverity, AgentResult } from "./agent-contract.js";

const severities = new Set<AgentFindingSeverity>(["low", "medium", "high", "critical"]);

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(item => String(item || "").trim()).filter(Boolean) : [];
}

function asSeverity(value: unknown): AgentFindingSeverity {
  const normalized = String(value || "").toLowerCase();
  return severities.has(normalized as AgentFindingSeverity) ? normalized as AgentFindingSeverity : "medium";
}

function asConfidence(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0.55;
}

export function normalizeAgentFinding(value: unknown): AgentFinding {
  const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    severity: asSeverity(item.severity),
    claim: asString(item.claim, "No concrete claim provided."),
    evidence: asStringArray(item.evidence),
    recommendation: asString(item.recommendation, "Review the loaded context and validate before changing code.")
  };
}

export function normalizeAgentResult(agentId: string, value: unknown): AgentResult {
  const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const recommendations = asStringArray(item.recommendations);
  const nextActions = asStringArray(item.nextActions);
  return {
    agentId,
    summary: asString(item.summary, "No structured summary returned."),
    findings: Array.isArray(item.findings) ? item.findings.map(normalizeAgentFinding).slice(0, 8) : [],
    risks: asStringArray(item.risks),
    uncertainties: asStringArray(item.uncertainties),
    nextActions: nextActions.length ? nextActions : recommendations,
    recommendations: recommendations.length ? recommendations : nextActions,
    confidence: asConfidence(item.confidence)
  };
}

export function parseAgentResultJson(agentId: string, text: string): AgentResult | null {
  const candidates = [
    text.match(/```json\s*([\s\S]*?)```/i)?.[1],
    text.match(/\{[\s\S]*\}/)?.[0]
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    try {
      return normalizeAgentResult(agentId, JSON.parse(candidate));
    } catch {
      // Try next candidate.
    }
  }
  return null;
}
