import { escapeHtml } from "../ui/escape.js";
import type { ResponseEvent } from "../state/response-events.js";
import { renderResponseEvents } from "./ResponseEvents.js";

export function renderThinkingState(thinkingStep: number, thinkingStartedAt: number, responseEvents: ResponseEvent[] = []) {
  const steps = [
    { label: "Reviewing repo context", detail: "Scanning docs, configs, and memory" },
    { label: "Comparing current UI layout", detail: "Analyzing conversation patterns" },
    { label: "Checking governance and runtime", detail: "Validating policies and actions" },
    { label: "Drafting the next best move", detail: "Synthesizing recommendations" }
  ];
  const active = steps[Math.min(thinkingStep, steps.length - 1)];
  const elapsed = thinkingStartedAt ? Math.max(1, Math.round((Date.now() - thinkingStartedAt) / 1000)) : 1;
  return `
    <article class="thinking-card" aria-live="polite" aria-label="AI Council is thinking">
      <div class="thinking-head">
        <div class="thinking-mark" aria-hidden="true"><span></span></div>
        <div>
          <strong>Thinking progress</strong>
          <p>${escapeHtml(active.detail)} - ${elapsed}s</p>
        </div>
      </div>
      ${responseEvents.length
        ? renderResponseEvents({ events: responseEvents, title: "Live response events" })
        : `<div class="thinking-steps">
            ${steps.map((step, index) => `
              <span class="${index < thinkingStep ? "done" : index === thinkingStep ? "current" : ""}">
                <b>${escapeHtml(step.label)}</b>
                <small>${escapeHtml(step.detail)}</small>
              </span>
            `).join("")}
          </div>`}
      <div class="thinking-footer"><span class="dot ok"></span>Working across agents <strong>3 active</strong></div>
    </article>
  `;
}

export function renderStaticProgressPanel() {
  const steps = [
    ["Reviewing repo context", "Scanned project docs and configs", "done"],
    ["Comparing current UI layout", "Analyzed conversation patterns", "done"],
    ["Checking governance and runtime", "Validated policies and actions", "current"],
    ["Drafting the next best move", "Synthesizing recommendations", ""]
  ];
  return `
    <aside class="progress-panel" aria-label="Thinking progress">
      <h3>Thinking progress</h3>
      <div class="progress-steps">
        ${steps.map(([label, detail, state]) => `
          <span class="${state}">
            <b>${escapeHtml(label)}</b>
            <small>${escapeHtml(detail)}</small>
          </span>
        `).join("")}
      </div>
      <div class="progress-footer"><span class="dot ok"></span>Working across agents <strong>3 active</strong></div>
    </aside>
  `;
}
