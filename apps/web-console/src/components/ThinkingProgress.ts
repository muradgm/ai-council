import { escapeHtml } from "../ui/escape.js";
import type { ResponseEvent } from "../state/response-events.js";

export function renderThinkingState(thinkingStep: number, thinkingStartedAt: number, responseEvents: ResponseEvent[] = []) {
  const steps = buildProgressSteps(responseEvents, thinkingStep);
  const active = steps.find(step => step.state === "current") || steps[steps.length - 1];
  const elapsed = thinkingStartedAt ? Math.max(1, Math.round((Date.now() - thinkingStartedAt) / 1000)) : 1;
  const activeAgents = Math.max(1, responseEvents.filter(event => event.status === "active").length);
  return `
    <article class="thinking-card" aria-live="polite" aria-label="AI Council is thinking">
      <div class="thinking-head">
        <div class="thinking-mark" aria-hidden="true"><span></span></div>
        <div>
          <strong>Thinking progress</strong>
          <p>${escapeHtml(active.detail)} - ${elapsed}s</p>
        </div>
      </div>
      ${renderProgressSteps(steps, "thinking-steps")}
      <div class="thinking-footer"><span class="dot ok"></span>Working across agents <strong title="Live council phases currently active">${activeAgents} active</strong></div>
    </article>
  `;
}

export function renderStaticProgressPanel(responseEvents: ResponseEvent[] = [], agentsUsed: string[] = []) {
  const steps = buildProgressSteps(responseEvents, responseEvents.length ? responseEvents.length : 99);
  const completed = !responseEvents.length || responseEvents.every(event => ["complete", "skipped"].includes(event.status));
  const agentCount = agentsUsed.length || 3;
  const agentTitle = agentsUsed.length ? agentsUsed.join(", ") : "Tech Lead, Security, QA";
  return `
    <aside class="progress-panel" aria-label="Thinking progress">
      <h3>Thinking progress</h3>
      ${renderProgressSteps(steps, "progress-steps")}
      <div class="progress-footer"><span class="dot ok"></span>${completed ? "Worked across agents" : "Working across agents"} <strong title="${escapeHtml(agentTitle)}">${agentCount} ${completed ? "used" : "active"}</strong></div>
    </aside>
  `;
}

type ProgressStep = {
  label: string;
  detail: string;
  state: "done" | "current" | "";
  types: ResponseEvent["type"][];
};

function buildProgressSteps(responseEvents: ResponseEvent[], fallbackStep: number): ProgressStep[] {
  const steps: ProgressStep[] = [
    {
      label: "Reading project context",
      detail: detailFor(responseEvents, ["context_read"], "Scanning docs, configs, and memory"),
      state: "",
      types: ["context_read"]
    },
    {
      label: "Selecting specialist agents",
      detail: detailFor(responseEvents, ["agent_started"], "Choosing the smallest useful Council team"),
      state: "",
      types: ["agent_started"]
    },
    {
      label: "Collecting findings",
      detail: detailFor(responseEvents, ["agent_finding_added"], "Turning agent signals into usable findings"),
      state: "",
      types: ["agent_finding_added"]
    },
    {
      label: "Checking risk and governance",
      detail: detailFor(responseEvents, ["risk_detected", "approval_required"], "Classifying warnings, approval needs, and safe actions"),
      state: "",
      types: ["risk_detected", "approval_required"]
    },
    {
      label: "Preparing final answer",
      detail: detailFor(responseEvents, ["validation_running", "final_answer_streamed"], "Validating shape and synthesizing the next move"),
      state: "",
      types: ["validation_running", "final_answer_streamed"]
    }
  ];

  if (!responseEvents.length) {
    return steps.map((step, index) => ({ ...step, state: index < fallbackStep ? "done" : index === fallbackStep ? "current" : "" }));
  }

  return steps.map((step, index) => {
    const related = responseEvents.filter(event => step.types.includes(event.type));
    if (!related.length) return { ...step, state: index === 0 ? "current" : "" };
    if (related.some(event => event.status === "active")) return { ...step, state: "current" };
    if (related.every(event => ["complete", "skipped"].includes(event.status))) return { ...step, state: "done" };
    return { ...step, state: "" };
  });
}

function detailFor(responseEvents: ResponseEvent[], types: ResponseEvent["type"][], fallback: string) {
  const event = responseEvents.find(item => types.includes(item.type) && item.status !== "pending")
    || responseEvents.find(item => types.includes(item.type));
  return event?.detail || fallback;
}

function renderProgressSteps(steps: ProgressStep[], className: string) {
  return `
    <div class="${className}">
      ${steps.map(step => `
        <span class="${step.state}">
          <b>${escapeHtml(step.label)}</b>
          <small>${escapeHtml(step.detail)}</small>
        </span>
      `).join("")}
    </div>
  `;
}
