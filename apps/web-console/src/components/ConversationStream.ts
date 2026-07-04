import type { ChatAttachment, ChatMessage } from "../state/console-state.js";
import { cleanAnswerText, escapeHtml, formatBytes } from "../ui/escape.js";
import { icon } from "../ui/icons.js";
import { renderAgentCards } from "./AgentCards.js";
import { renderResponseEvents } from "./ResponseEvents.js";
import { renderStaticProgressPanel, renderThinkingState } from "./ThinkingProgress.js";
import type { ResponseEvent } from "../state/response-events.js";

type ConversationStreamProps = {
  chatBusy: boolean;
  chatMessages: ChatMessage[];
  responseEvents: ResponseEvent[];
  thinkingStartedAt: number;
  thinkingStep: number;
};

export function renderChatMessages(props: ConversationStreamProps) {
  if (!props.chatMessages.length) {
    return `
      <div class="welcome-message">
        <h2>What decision are we making?</h2>
        <p>Ask for a review, plan, architecture call, debugging pass, or product judgement. AI Council will route the work, read the available context, use the local model, and synthesize the next move.</p>
        <div class="prompt-row">
          <button class="prompt-chip" data-prompt="Review this repo and tell me the highest-leverage next step.">Review the repo</button>
          <button class="prompt-chip" data-prompt="What should this console understand about my current project before it answers?">Improve context awareness</button>
          <button class="prompt-chip" data-prompt="Plan the next AI Council runtime improvement with risks, evidence, and validation.">Plan runtime work</button>
          <button class="prompt-chip" data-prompt="What should be fixed before this goes public on GitHub?">GitHub readiness</button>
        </div>
      </div>
    `;
  }
  return `${props.chatMessages.map(message => `
    <article class="chat-message ${message.role}">
      ${message.role === "assistant"
        ? `<div class="assistant-head">
            <span class="assistant-mark">${icon("sparkle")}</span>
            <strong>AI Council</strong>
            <span class="thinking-pill">Thinking</span>
            <button class="ghost-icon" type="button" data-more-menu="true" aria-label="More response options" title="More response options">${icon("more")}</button>
          </div>${renderAssistantAnswer(message.text)}`
        : `<div class="user-card">
            <span class="avatar">AM</span>
            <div class="user-message-body">
              <div class="message-role"><strong>You</strong><span>${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></div>
              <p>${escapeHtml(message.text)}</p>
            </div>
          </div>`}
      ${message.role === "user" && message.attachments?.length ? renderMessageAttachments(message.attachments) : ""}
      ${message.role === "assistant" && message.events?.length ? renderResponseEvents({ events: message.events, title: "Response event trail" }) : ""}
      ${message.meta ? `<div class="message-meta">
        <span>${escapeHtml(message.meta.selectedCouncil)}</span>
        <span>${escapeHtml(message.meta.selectedProvider)}</span>
        <span>${escapeHtml(message.meta.agentsUsed.join(", "))}</span>
      </div>` : ""}
    </article>
  `).join("")}${props.chatBusy ? renderThinkingState(props.thinkingStep, props.thinkingStartedAt, props.responseEvents) : ""}`;
}

function renderAssistantAnswer(text: string) {
  const sections = parseAnswerSections(text);
  if (sections.length < 2) {
    return `<div class="council-response-layout">${renderStaticProgressPanel()}<div class="answer-stream"><section class="answer-section read">${icon("sparkle")}<p>${escapeHtml(text)}</p></section>${renderResponseActions()}</div></div>`;
  }
  return `
    <div class="council-response-layout">
      ${renderStaticProgressPanel()}
      <div class="answer-stream">
        ${sections.map((section, index) => `
          ${index === 1 ? renderAgentCards() : ""}
          ${isDetailSection(section.key)
            ? `<details class="answer-details ${section.key}">
                <summary>View ${escapeHtml(section.label.toLowerCase())}</summary>
                <p>${escapeHtml(cleanAnswerText(section.body))}</p>
              </details>`
            : `<section class="answer-section ${section.key}">
                ${icon("sparkle")}
                <h3>${escapeHtml(section.label)}</h3>
                <p>${escapeHtml(cleanAnswerText(section.body))}</p>
                ${index === sections.length - 1 ? renderResponseActions() : ""}
              </section>`}
        `).join("")}
      </div>
    </div>
  `;
}

function renderResponseActions() {
  return `<div class="response-actions">
    <button type="button" data-feedback="helpful" aria-label="Mark response helpful" title="Mark response helpful">${icon("thumbsUp")}</button>
    <button type="button" data-copy-latest-answer="true" aria-label="Copy latest answer" title="Copy latest answer">${icon("copy")}</button>
  </div>`;
}

function isDetailSection(key: string) {
  return ["model", "trace", "evidence"].includes(key);
}

function renderMessageAttachments(attachments: ChatAttachment[]) {
  return `
    <div class="message-attachments">
      ${attachments.map(file => `
        <span>
          <strong>${escapeHtml(file.name)}</strong>
          <small>${escapeHtml(formatBytes(file.size))}</small>
        </span>
      `).join("")}
    </div>
  `;
}

function parseAnswerSections(text: string) {
  const labels = [
    ["Read", "read"],
    ["Why it matters", "why"],
    ["Findings", "findings"],
    ["Next move", "next"],
    ["Risks", "risks"],
    ["Uncertainty", "uncertainty"],
    ["Evidence", "evidence"],
    ["Model synthesis", "model"],
    ["Trace", "trace"]
  ] as const;
  const escaped = labels.map(([label]) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`(^|\\n)(${escaped}):\\n`, "g");
  const matches = Array.from(text.matchAll(pattern));
  if (!matches.length) return [{ label: "Read", key: "read", body: text }];
  return matches.map((match, index) => {
    const label = match[2];
    const start = (match.index || 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const key = labels.find(([known]) => known === label)?.[1] || "read";
    return { label, key, body: text.slice(start, end).trim() };
  }).filter(section => section.body);
}
