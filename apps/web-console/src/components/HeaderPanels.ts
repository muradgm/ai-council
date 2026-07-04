import type { ProviderHealthResponse, Summary } from "../types.js";
import { escapeHtml } from "../ui/escape.js";
import { icon } from "../ui/icons.js";

type HeaderPanelsProps = {
  actionNotice: string;
  apiBase: string;
  currentUrl: string;
  hasLatestAnswer: boolean;
  moreMenuOpen: boolean;
  providerHealth: ProviderHealthResponse | null;
  recordCount: number;
  settingsOpen: boolean;
  shareOpen: boolean;
  summary: Summary | null;
};

export function renderHeaderPanels(props: HeaderPanelsProps) {
  return `
    <div class="floating-panel-layer" aria-live="polite">
      ${props.shareOpen ? `
        <section class="floating-panel" id="sharePanel" aria-label="Share console">
          <h2>Share local console</h2>
          <p>This console is running against your local workspace. Share the URL only with someone who can reach this machine and API.</p>
          <div class="panel-field">${escapeHtml(props.currentUrl)}</div>
          <button class="panel-action" type="button" data-copy-url="true">${icon("copy")} Copy local URL</button>
        </section>
      ` : ""}
      ${props.settingsOpen ? `
        <section class="floating-panel" id="settingsPanel" aria-label="Console settings">
          <h2>Console settings</h2>
          <div class="panel-row"><span>API base</span><strong>${escapeHtml(props.apiBase)}</strong></div>
          <div class="panel-row"><span>Health</span><strong>${escapeHtml(props.summary?.health.status || "loading")}</strong></div>
          <div class="panel-row"><span>Theme</span><strong>Dark Council</strong></div>
          <div class="panel-row"><span>Indexed records</span><strong>${props.recordCount}</strong></div>
          <div class="panel-row"><span>Provider</span><strong>${props.providerHealth ? "Checked" : "Pending"}</strong></div>
        </section>
      ` : ""}
      ${props.moreMenuOpen ? `
        <section class="floating-panel more-menu-panel" id="moreMenu" aria-label="More options">
          <h2>Conversation actions</h2>
          <button class="menu-action" type="button" data-clear-chat="true">${icon("new-chat")} Clear chat</button>
          <button class="menu-action" type="button" data-export-chat="true">${icon("projects")} Export chat JSON</button>
          <button class="menu-action" type="button" data-copy-latest-answer="true" ${props.hasLatestAnswer ? "" : `disabled title="No Council answer to copy yet"`}>${icon("copy")} Copy latest answer</button>
        </section>
      ` : ""}
      ${props.actionNotice ? `<div class="action-notice" role="status">${escapeHtml(props.actionNotice)}</div>` : ""}
    </div>
  `;
}
