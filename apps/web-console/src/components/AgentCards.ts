import { escapeHtml } from "../ui/escape.js";
import { icon } from "../ui/icons.js";

export function renderAgentCards() {
  const agents = [
    { icon: "code", name: "Tech Lead", status: "Analyzing", tone: "teal", text: "Found opportunities to stream updates and reduce noise in the conversation." },
    { icon: "shield", name: "Security", status: "Reviewing", tone: "warn", text: "Action runtime looks solid. Recommend adding approvals and narrowing safe execution." },
    { icon: "check", name: "QA", status: "Testing", tone: "violet", text: "Coverage is good on core flows. Edge cases need cancellation and retry checks." }
  ];
  return `
    <div class="agent-card-grid">
      ${agents.map(agent => `
        <article class="agent-card ${agent.tone}">
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
