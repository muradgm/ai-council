import type { AskResponse } from "../types.js";

export type ResponseEventType =
  | "agent_started"
  | "context_read"
  | "agent_finding_added"
  | "risk_detected"
  | "action_proposed"
  | "approval_required"
  | "validation_running"
  | "final_answer_streamed";

export type ResponseEventStatus = "pending" | "active" | "complete" | "blocked" | "skipped";

export type ResponseEvent = {
  id: string;
  type: ResponseEventType;
  label: string;
  detail: string;
  status: ResponseEventStatus;
  tone: "teal" | "blue" | "violet" | "warn" | "danger";
  createdAt: string;
};

export function createResponseEvents(input: string, projectLabel: string): ResponseEvent[] {
  const now = new Date().toISOString();
  const shortInput = input.trim().replace(/\s+/g, " ").slice(0, 96);
  return [
    event("context_read", "Context loading", `Loading project, provider, and runtime context for ${projectLabel || "General"}.`, "active", "blue", now),
    event("agent_started", "Agents queued", `Routing ${projectLabel || "General"} request: ${shortInput}`, "pending", "violet", now),
    event("agent_finding_added", "Finding added", "Waiting for the Council to identify the most useful signal.", "pending", "teal", now),
    event("risk_detected", "Risk checked", "Checking warnings, uncertainty, and safety boundaries.", "pending", "warn", now),
    event("action_proposed", "Action proposed", "Preparing a concrete next move instead of a generic answer.", "pending", "teal", now),
    event("approval_required", "Approval gate", "Checking whether the proposed action needs human approval.", "pending", "warn", now),
    event("validation_running", "Validation running", "Checking the response shape against Council expectations.", "pending", "blue", now),
    event("final_answer_streamed", "Final answer streamed", "Composing the final answer for the conversation.", "pending", "violet", now)
  ];
}

export function advanceResponseEvents(events: ResponseEvent[], step: number): ResponseEvent[] {
  return events.map((item, index) => ({
    ...item,
    status: index < step ? completedStatus(item) : index === step ? "active" : "pending"
  }));
}

export function finalizeResponseEvents(events: ResponseEvent[], response: AskResponse): ResponseEvent[] {
  return events.map(item => {
    if (item.type === "agent_started") {
      return { ...item, detail: `Selected ${response.selectedCouncil} through ${response.selectedProvider}.`, status: "complete" };
    }
    if (item.type === "context_read") {
      return { ...item, detail: `Used agents: ${response.agentsUsed.join(", ") || "Council route"}.`, status: "complete" };
    }
    if (item.type === "agent_finding_added") {
      return { ...item, detail: "Council synthesized a project-aware finding for the answer.", status: "complete" };
    }
    if (item.type === "risk_detected") {
      return {
        ...item,
        detail: response.warnings.length ? response.warnings.join(" ") : "No policy warnings were returned for this answer.",
        status: response.warnings.length ? "complete" : "skipped"
      };
    }
    if (item.type === "approval_required") {
      return { ...item, detail: "No external action approval was required for this response.", status: "skipped" };
    }
    return { ...item, status: "complete" };
  });
}

export function failResponseEvents(events: ResponseEvent[], error: unknown): ResponseEvent[] {
  return events.map(item => {
    if (item.status === "active" || item.status === "pending") {
      return { ...item, detail: `Stopped: ${String(error)}`, status: "blocked", tone: "danger" };
    }
    return item;
  });
}

function event(
  type: ResponseEventType,
  label: string,
  detail: string,
  status: ResponseEventStatus,
  tone: ResponseEvent["tone"],
  createdAt: string
): ResponseEvent {
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

function completedStatus(item: ResponseEvent): ResponseEventStatus {
  return item.type === "approval_required" ? "skipped" : "complete";
}
