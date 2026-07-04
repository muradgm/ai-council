import { displayTitle } from "../state.js";
import type { CatalogItem } from "../types.js";
import type { ChatAttachment } from "../state/console-state.js";
import { escapeHtml, formatBytes } from "../ui/escape.js";
import { icon } from "../ui/icons.js";

type ComposerProps = {
  agentOptions: CatalogItem[];
  chatAttachments: ChatAttachment[];
  chatBusy: boolean;
  chatInput: string;
  chatMode: "orchestrator" | "agent";
  currentProject: string;
  projectOptions: Array<{ id: string; name: string; source: "repo" | "local" }>;
  selectedAgent: string;
};

export function renderComposer(props: ComposerProps) {
  return `
    <form class="composer" onsubmit="return false;">
      <div class="composer-shell">
        <textarea id="chatInput" aria-label="Message AI Council" placeholder="Ask AI Council">${escapeHtml(props.chatInput)}</textarea>
        ${renderAttachmentTray(props.chatAttachments)}
        <div class="composer-footer">
          <input class="sr-only" id="attachmentInput" type="file" multiple />
          <button class="composer-plus" type="button" id="attachButton" aria-label="Attach files">+</button>
          <div class="composer-controls" aria-label="Conversation context controls">
            <label class="compact-control">
              <span>Project</span>
              <select id="chatProject" aria-label="Project context">
                <option value="">General</option>
                ${props.projectOptions.map(project => `<option value="${escapeHtml(project.id)}" ${props.currentProject === project.id ? "selected" : ""}>${escapeHtml(project.name)}${project.source === "local" ? " - local" : ""}</option>`).join("")}
              </select>
            </label>
            <label class="compact-control">
              <span>Mode</span>
              <select id="chatMode" aria-label="Conversation mode">
                <option value="orchestrator" ${props.chatMode === "orchestrator" ? "selected" : ""}>Orchestrator</option>
                <option value="agent" ${props.chatMode === "agent" ? "selected" : ""}>Single agent</option>
              </select>
            </label>
            <label class="compact-control">
              <span>Agent</span>
              <select id="chatAgent" aria-label="Selected agent" ${props.chatMode === "agent" ? "" : "disabled"}>
                ${props.agentOptions.map(agent => `<option value="${escapeHtml(agent.id)}" ${props.selectedAgent === agent.id ? "selected" : ""}>${escapeHtml(displayTitle(agent))}</option>`).join("")}
              </select>
            </label>
          </div>
          <button class="mic-button" type="button" aria-label="Voice input coming soon" title="Voice input coming soon" disabled>${icon("mic")}</button>
          <button class="send-button" id="chatSend" aria-label="${props.chatBusy ? "AI Council is thinking" : "Send message"}">${props.chatBusy ? icon("more") : icon("send")}</button>
        </div>
      </div>
    </form>
  `;
}

function renderAttachmentTray(chatAttachments: ChatAttachment[]) {
  if (!chatAttachments.length) return "";
  return `
    <div class="attachment-tray" aria-label="Attached files">
      ${chatAttachments.map((file, index) => `
        <span class="attachment-chip">
          <strong>${escapeHtml(file.name)}</strong>
          <small>${escapeHtml(formatBytes(file.size))}</small>
          <button type="button" data-remove-attachment="${index}" aria-label="Remove ${escapeHtml(file.name)}">x</button>
        </span>
      `).join("")}
    </div>
  `;
}
