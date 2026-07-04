import { collections } from "../state.js";
import type { CollectionName, Summary } from "../types.js";
import { escapeHtml } from "../ui/escape.js";
import { icon } from "../ui/icons.js";

type WorkspaceHeaderProps = {
  activeCollection: CollectionName;
  activeView: "chat" | "projects" | "data" | "catalog" | "runtime";
  moreMenuOpen: boolean;
  panelsHtml: string;
  shareOpen: boolean;
  summary: Summary | null;
};

export function renderWorkspaceHeader(props: WorkspaceHeaderProps) {
  const label = props.activeView === "chat"
    ? "Improve response flow"
    : props.activeView === "projects"
      ? "Projects"
      : props.activeView === "data"
        ? "Data"
        : props.activeView === "runtime"
          ? "Runtime Workbench"
          : "Knowledge";
  return `
    <header class="workspace-header">
      <div class="workspace-title">
        <h1>${escapeHtml(label)} ${props.activeView === "chat" ? icon("chevron") : ""}</h1>
        <p>${escapeHtml(headerSubtitle(props.activeView, props.activeCollection))}</p>
      </div>
      <div class="header-actions">
        <button class="secondary-button share-button" type="button" data-share="true" aria-expanded="${props.shareOpen}" aria-controls="sharePanel">${icon("share")} Share</button>
        <button class="secondary-button icon-only" type="button" data-more-menu="true" aria-label="More options" title="More options" aria-expanded="${props.moreMenuOpen}" aria-controls="moreMenu">${icon("more")}</button>
        <span class="status-pill live"><span class="dot ok"></span>${props.summary?.health.status === "ready" ? "Live" : "Loading"}</span>
      </div>
      ${props.panelsHtml}
    </header>
  `;
}

function headerSubtitle(activeView: WorkspaceHeaderProps["activeView"], activeCollection: CollectionName) {
  if (activeView === "chat") return "";
  if (activeView === "projects") return "Choose context first, then bring it into the conversation.";
  if (activeView === "data") return "Inspect Council coverage, runtime activity, provider readiness, and recent operating signals.";
  if (activeView === "runtime") return "Generate context, run the Council loop, and score the result.";
  return collections.find(c => c.id === activeCollection)?.description || "Browse the local Council knowledge base.";
}
