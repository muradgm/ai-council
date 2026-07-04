import type { ResponseEvent } from "../state/response-events.js";
import { escapeHtml } from "../ui/escape.js";

type ResponseEventsProps = {
  events: ResponseEvent[];
  title?: string;
};

export function renderResponseEvents(props: ResponseEventsProps) {
  if (!props.events.length) return "";
  const activeCount = props.events.filter(event => event.status === "active").length;
  const completeCount = props.events.filter(event => event.status === "complete").length;
  const statusSummary = activeCount ? `${activeCount} active` : `${completeCount} done`;

  return `
    <aside class="event-panel" aria-label="${escapeHtml(props.title || "Response events")}">
      <div class="event-panel-head">
        <h3>${escapeHtml(props.title || "Response flow")}</h3>
        <span>${escapeHtml(statusSummary)}</span>
      </div>
      <div class="event-list">
        ${props.events.map(event => `
          <div class="event-row ${event.status} ${event.tone}">
            <span class="event-dot" aria-hidden="true"></span>
            <div>
              <strong>${escapeHtml(event.label)}</strong>
              <small>${escapeHtml(event.detail)}</small>
            </div>
            <em>${escapeHtml(statusLabel(event.status))}</em>
          </div>
        `).join("")}
      </div>
    </aside>
  `;
}

function statusLabel(status: ResponseEvent["status"]) {
  if (status === "complete") return "done";
  if (status === "active") return "now";
  if (status === "blocked") return "blocked";
  if (status === "skipped") return "clear";
  return "queued";
}
