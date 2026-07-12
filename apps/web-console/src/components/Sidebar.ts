import { collections, countFor } from "../state.js";
import type { CollectionName, Summary } from "../types.js";
import type { LocalProject, NavItem } from "../state/console-state.js";
import { escapeHtml } from "../ui/escape.js";
import { icon } from "../ui/icons.js";

type SidebarProps = {
  activeCollection: CollectionName;
  activeView: "chat" | "projects" | "data" | "catalog" | "runtime";
  apiBase: string;
  brandMotionActive: boolean;
  chatProject: string;
  localProjects: LocalProject[];
  navItems: NavItem[];
  projectList: Array<{ name: string; rel: string; hasMemory: boolean; hasProjectFile: boolean }>;
  recentChats: string[];
  selectedProject: string;
  sidebarCollapsed: boolean;
  settingsOpen: boolean;
  summary: Summary | null;
  totalRecords: number;
};

export function renderSidebar(props: SidebarProps) {
  return `
    <aside class="app-sidebar">
      <div class="brand-block">
        <div class="brand-mark council-core ${props.brandMotionActive ? "is-activating" : "is-settled"}" aria-hidden="true">
          <span class="core-node top"></span>
          <span class="core-node left"></span>
          <span class="core-node right"></span>
          <span class="core-center"></span>
        </div>
        <div>
          <strong>AI Council</strong>
          <span>${props.summary?.health.status === "ready" ? "Live workspace" : "Local console"}</span>
        </div>
        <button class="sidebar-toggle" type="button" data-sidebar-toggle="true" aria-label="${props.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}" title="${props.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}" aria-pressed="${props.sidebarCollapsed}">${icon("panel")}</button>
      </div>

      <button class="new-chat-button" data-new-chat="true">
        <span>${icon("new-chat")} New chat</span>
        <strong>+</strong>
      </button>

      <nav class="primary-nav">
        ${props.navItems.map(item => `
          <button class="nav-row ${isNavActive(item, props.activeView, props.activeCollection) ? "active" : ""}" data-view="${item.view}" ${item.collection ? `data-nav-collection="${item.collection}"` : ""}>
            <span>${icon(item.icon)} ${escapeHtml(item.label)}</span>
          </button>
        `).join("")}
      </nav>

      <div class="sidebar-section recent-section">
        <div class="sidebar-heading">Recent chats <span>${icon("chevron")}</span></div>
        <div class="thread-list">
          ${props.recentChats.map((chat, index) => `
            <button class="thread-row ${index === 0 ? "active" : ""}" data-recent-chat="${escapeHtml(chat)}">
              <span>${escapeHtml(chat)}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="sidebar-section project-section">
        <div class="sidebar-heading">Projects</div>
        <button class="sidebar-import" data-import-project="true">${icon("projects")} Add local project</button>
        <div class="thread-list">
          ${props.projectList.slice(0, 4).map(project => `
            <button class="thread-row project-row ${props.chatProject === project.name || props.selectedProject === project.name ? "active" : ""}" data-sidebar-project="${escapeHtml(project.name)}">
              <span>${escapeHtml(project.name)}</span>
              <small>${project.hasMemory ? "memory" : "new"}</small>
            </button>
          `).join("")}
          ${props.localProjects.slice(0, 3).map(project => `
            <button class="thread-row ${props.chatProject === project.id ? "active" : ""}" data-sidebar-project="${escapeHtml(project.id)}">
              <span>${escapeHtml(project.name)}</span>
              <small>local</small>
            </button>
          `).join("")}
          ${props.projectList.length || props.localProjects.length ? "" : `<p class="sidebar-empty">No projects found.</p>`}
        </div>
      </div>

      <div class="sidebar-section knowledge-section">
        <div class="sidebar-heading">Knowledge</div>
        <div class="tool-list">
          ${collections.slice(0, 5).map(c => `
            <button class="tool-row ${props.activeCollection === c.id && props.activeView === "catalog" ? "active" : ""}" data-collection="${c.id}">
              <span>${escapeHtml(c.label)}</span>
              <strong>${countFor(props.summary, c.id)}</strong>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="sidebar-account">
        <div class="user-chip">
          <span class="avatar">AM</span>
          <div><strong>AI Council</strong><small>Owner workspace</small></div>
          <span>${icon("chevron")}</span>
        </div>
        <div class="team-chip">
          <span class="team-dot"></span>
          <strong>Orion Team</strong>
          <span>${icon("chevron")}</span>
        </div>
      </div>

      <div class="sidebar-status">
        <span class="dot ${props.summary?.health.status === "ready" ? "ok" : "warn"}"></span>
        <div>
          <strong>${props.summary ? `${props.totalRecords} records indexed` : "Loading index"}</strong>
          <small>${escapeHtml(props.apiBase)}</small>
        </div>
        <button class="settings-button" type="button" data-open-settings="true" aria-label="Console settings" title="Console settings" aria-expanded="${props.settingsOpen}" aria-controls="settingsPanel">${icon("settings")}</button>
      </div>
    </aside>
  `;
}

function isNavActive(item: NavItem, activeView: SidebarProps["activeView"], activeCollection: CollectionName) {
  if (item.collection) return activeView === item.view && activeCollection === item.collection;
  return activeView === item.view;
}
