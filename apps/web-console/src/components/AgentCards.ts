import { escapeHtml } from "../ui/escape.js";
import { icon } from "../ui/icons.js";
import type { ResponseEvent } from "../state/response-events.js";

export function renderAgentCards(responseEvents: ResponseEvent[] = [], agentsUsed: string[] = []) {
  const complete = !responseEvents.length || responseEvents.every(event => ["complete", "skipped"].includes(event.status));
  const progress = complete ? 100 : 68;
  const agents = buildAgents(agentsUsed, complete);
  return `
    <div class="agent-card-grid">
      ${agents.map(agent => `
        <article class="agent-card ${agent.tone} ${complete ? "complete" : ""}" style="--agent-progress: ${progress}%">
          <div class="agent-card-head">
            <span>${icon(agent.icon)}</span>
            <strong>${escapeHtml(agent.name)}</strong>
            <em>${escapeHtml(agent.status)}</em>
          </div>
          <small>10:42 AM</small>
          <p>${escapeHtml(agent.text)}</p>
          <div class="agent-progress"></div>
        </article>
      `).join("")}
    </div>
  `;
}

function buildAgents(agentsUsed: string[], complete: boolean) {
  const fallback = [
    { icon: "code", name: "Tech Lead", status: complete ? "Complete" : "Analyzing", tone: "teal", text: "Found opportunities to stream updates and reduce noise in the conversation." },
    { icon: "shield", name: "Security", status: complete ? "Complete" : "Reviewing", tone: "warn", text: "Action runtime looks solid. Recommend adding approvals and narrowing safe execution." },
    { icon: "check", name: "QA", status: complete ? "Complete" : "Testing", tone: "violet", text: "Coverage is good on core flows. Edge cases need cancellation and retry checks." }
  ];
  if (!agentsUsed.length) return fallback;

  const tones = ["teal", "warn", "violet"] as const;
  const icons = ["code", "shield", "check"] as const;
  return agentsUsed.slice(0, 3).map((agent, index) => ({
    icon: icons[index] || "code",
    name: titleCase(agent),
    status: complete ? "Complete" : index === 0 ? "Leading" : "Supporting",
    tone: tones[index] || "teal",
    text: complete
      ? "Finished this phase and handed its signal to the final Council synthesis."
      : "Working through the current request and feeding useful signal back to the Council."
  }));
}

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
