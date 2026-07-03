import { api } from "./api.js";
import { collections, compactText, countFor, displayTitle } from "./state.js";
import type { AskResponse, CatalogItem, CollectionName, ObservabilityResponse, ProjectDetailResponse, ProviderHealthResponse, RouteResponse, RuntimeActionResponse, RuntimeSnapshot, Summary } from "./types.js";

const app = document.querySelector<HTMLDivElement>("#app")!;
const CHAT_STORAGE_KEY = "aiCouncilChatMessages";
const LOCAL_PROJECTS_STORAGE_KEY = "aiCouncilLocalProjects";

type ChatAttachment = {
  name: string;
  type: string;
  size: number;
  text?: string;
};

type LocalProject = {
  id: string;
  name: string;
  fileCount: number;
  files: ChatAttachment[];
  preview: string;
  importedAt: string;
};

type ChatMessage = { role: "user" | "assistant"; text: string; meta?: AskResponse; attachments?: ChatAttachment[] };
type NavItem = {
  label: string;
  icon: string;
  view: "chat" | "projects" | "data" | "catalog" | "runtime";
  collection?: CollectionName;
};

const navItems: NavItem[] = [
  { label: "Search", icon: "search", view: "chat" },
  { label: "Agents", icon: "agents", view: "catalog", collection: "agents" as CollectionName },
  { label: "Councils", icon: "councils", view: "catalog", collection: "workflows" as CollectionName },
  { label: "Projects", icon: "projects", view: "projects" },
  { label: "Runtime", icon: "runtime", view: "runtime" },
  { label: "Observability", icon: "observability", view: "data" },
  { label: "Library", icon: "library", view: "catalog", collection: "skills" as CollectionName }
];

const recentChats = [
  "Improve response flow",
  "Safety & approvals roadmap",
  "Runtime observability gaps",
  "UI feedback triage",
  "Model strategy discussion"
];

function readStoredChatMessages(): ChatMessage[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((message): message is ChatMessage =>
      (message?.role === "user" || message?.role === "assistant") && typeof message?.text === "string"
    );
  } catch {
    return [];
  }
}

function persistChatMessages(messages: ChatMessage[]) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-40)));
}

function readStoredLocalProjects(): LocalProject[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_PROJECTS_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((project): project is LocalProject =>
      typeof project?.id === "string" && typeof project?.name === "string" && Array.isArray(project?.files)
    );
  } catch {
    return [];
  }
}

function persistLocalProjects(projects: LocalProject[]) {
  localStorage.setItem(LOCAL_PROJECTS_STORAGE_KEY, JSON.stringify(projects.slice(-8)));
}

let summary: Summary | null = null;
let activeCollection: CollectionName = "agents";
let activeItems: CatalogItem[] = [];
let lastRoute: RouteResponse | null = null;
let runtime: RuntimeSnapshot | null = null;
let lastRuntimeAction: RuntimeActionResponse | null = null;
let providerHealth: ProviderHealthResponse | null = null;
let observability: ObservabilityResponse | null = null;
let chatMessages: ChatMessage[] = readStoredChatMessages();
let chatAttachments: ChatAttachment[] = [];
let localProjects: LocalProject[] = readStoredLocalProjects();
let chatInput = "Review AI Council like a senior tech lead. Be candid, specific, and tell me the next best move.";
let chatProject = "";
let chatBusy = false;
let thinkingStep = 0;
let thinkingStartedAt = 0;
let thinkingTimer: number | undefined;
let searchTerm = "";
let runtimeProject = "TradeFrame";
let runtimeTask = "review the trading journal MVP architecture";
let activeView: "chat" | "projects" | "data" | "catalog" | "runtime" = "chat";
let projectList: Array<{ name: string; rel: string; hasMemory: boolean; hasProjectFile: boolean }> = [];
let selectedProject = "";
let projectDetail: ProjectDetailResponse | null = null;
let agentOptions: CatalogItem[] = [];
let chatMode: "orchestrator" | "agent" = "orchestrator";
let selectedAgent = "software-architect";

function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pill(text: string): string {
  return `<span class="pill">${escapeHtml(text)}</span>`;
}

function totalIndexedRecords(currentSummary: Summary): number {
  return Object.values(currentSummary.counts).reduce<number>((total, value) => total + Number(value || 0), 0);
}

function setChatMessages(messages: ChatMessage[]) {
  chatMessages = messages;
  persistChatMessages(chatMessages);
}

function setLocalProjects(projects: LocalProject[]) {
  localProjects = projects;
  persistLocalProjects(localProjects);
}

function setThinking(active: boolean) {
  if (thinkingTimer) window.clearInterval(thinkingTimer);
  thinkingTimer = undefined;
  if (!active) {
    thinkingStep = 0;
    thinkingStartedAt = 0;
    return;
  }
  thinkingStep = 0;
  thinkingStartedAt = Date.now();
  thinkingTimer = window.setInterval(() => {
    thinkingStep = Math.min(thinkingStep + 1, 3);
    renderShell();
  }, 900);
}

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function currentProject() {
  return chatProject;
}

function currentProjectLabel() {
  return currentLocalProject()?.name || currentProject() || "General";
}

function currentLocalProject() {
  return localProjects.find(project => project.id === chatProject);
}

function projectOptions() {
  return [
    ...projectList.map(project => ({ id: project.name, name: project.name, source: "repo" as const })),
    ...localProjects.map(project => ({ id: project.id, name: project.name, source: "local" as const }))
  ];
}

function attachmentSummary(attachments: ChatAttachment[]) {
  if (!attachments.length) return "";
  return attachments
    .map(file => `- ${file.name} (${formatBytes(file.size)}${file.type ? `, ${file.type}` : ""})${file.text ? `\n${file.text.slice(0, 3000)}` : ""}`)
    .join("\n\n");
}

function localProjectPrompt(project: LocalProject) {
  return [
    `Local project selected: ${project.name}`,
    `Files reviewed in browser: ${project.fileCount}`,
    "",
    "Relevant local project context:",
    attachmentSummary(project.files)
  ].join("\n");
}

function buildPrompt(input: string) {
  const parts = [input];
  const localProject = currentLocalProject();
  if (localProject) parts.push(localProjectPrompt(localProject));
  if (chatAttachments.length) {
    parts.push(["Attached files:", attachmentSummary(chatAttachments)].join("\n"));
  }
  return parts.join("\n\n---\n\n");
}

function apiProjectId() {
  return currentLocalProject() ? undefined : currentProject().trim() || undefined;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
}

function cleanAnswerText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .trim();
}

function isNavActive(item: (typeof navItems)[number]) {
  if (item.collection) return activeView === item.view && activeCollection === item.collection;
  return activeView === item.view;
}

function icon(name: string) {
  const paths: Record<string, string> = {
    "new-chat": `<path d="M5 12h14"/><path d="M12 5v14"/><path d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/>`,
    search: `<circle cx="11" cy="11" r="7"/><path d="m20 20-4.2-4.2"/>`,
    agents: `<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="10" r="2.5"/><path d="M14.5 19a4.5 4.5 0 0 1 6-3.8"/>`,
    councils: `<circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><circle cx="12" cy="17" r="3"/><path d="M9.5 10.5 11 14"/><path d="m14.5 10.5-1.5 3.5"/>`,
    projects: `<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>`,
    runtime: `<path d="M12 2v5"/><path d="M12 17v5"/><path d="M2 12h5"/><path d="M17 12h5"/><path d="m4.9 4.9 3.5 3.5"/><path d="m15.6 15.6 3.5 3.5"/><path d="m19.1 4.9-3.5 3.5"/><path d="m8.4 15.6-3.5 3.5"/>`,
    observability: `<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 14h2v2H8z"/><path d="M11 10h2v6h-2z"/><path d="M14 7h2v9h-2z"/>`,
    library: `<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"/><path d="M8 4v13a3 3 0 0 0 3 3"/><path d="M9 8h5"/>`,
    panel: `<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 5v14"/><path d="M12 9h5"/><path d="M12 13h5"/>`,
    settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-3v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4v-3h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v3h-.1a1.7 1.7 0 0 0-1.5 1Z"/>`,
    sparkle: `<path d="M12 2 14 9l7 3-7 3-2 7-2-7-7-3 7-3Z"/>`,
    code: `<path d="m10 8-4 4 4 4"/><path d="m14 8 4 4-4 4"/>`,
    shield: `<path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6Z"/>`,
    check: `<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>`,
    mic: `<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>`,
    send: `<path d="m21 3-7.5 18-3-7.5-7.5-3Z"/><path d="m21 3-10.5 10.5"/>`,
    share: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-4.2"/><path d="m8.6 13.4 6.8 4.2"/>`,
    chevron: `<path d="m8 10 4 4 4-4"/>`,
    more: `<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>`,
    thumbsUp: `<path d="M7 11v9H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z"/><path d="M7 11 12 3a2 2 0 0 1 3 2l-1 4h4a2 2 0 0 1 2 2l-1.5 7a2 2 0 0 1-2 2H7"/>`,
    copy: `<rect x="8" y="8" width="12" height="12" rx="2"/><rect x="4" y="4" width="12" height="12" rx="2"/>`
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
}

function renderShell() {
  app.innerHTML = `
    <main class="app-shell">
      <aside class="app-sidebar">
        <div class="brand-block">
          <div class="brand-mark" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <div>
            <strong>AI Council</strong>
            <span>${summary?.health.status === "ready" ? "Live workspace" : "Local console"}</span>
          </div>
          <button class="sidebar-toggle" type="button" aria-label="Toggle sidebar">${icon("panel")}</button>
        </div>

        <button class="new-chat-button" data-new-chat="true">
          <span>${icon("new-chat")} New chat</span>
          <strong>+</strong>
        </button>

        <nav class="primary-nav">
          ${navItems.map(item => `
            <button class="nav-row ${isNavActive(item) ? "active" : ""}" data-view="${item.view}" ${item.collection ? `data-nav-collection="${item.collection}"` : ""}>
              <span>${icon(item.icon)} ${escapeHtml(item.label)}</span>
            </button>
          `).join("")}
        </nav>

        <div class="sidebar-section recent-section">
          <div class="sidebar-heading">Recent chats <span>${icon("chevron")}</span></div>
          <div class="thread-list">
            ${recentChats.map((chat, index) => `
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
            ${projectList.slice(0, 4).map(project => `
              <button class="thread-row project-row ${chatProject === project.name || selectedProject === project.name ? "active" : ""}" data-sidebar-project="${escapeHtml(project.name)}">
                <span>${escapeHtml(project.name)}</span>
                <small>${project.hasMemory ? "memory" : "new"}</small>
              </button>
            `).join("")}
            ${localProjects.slice(0, 3).map(project => `
              <button class="thread-row ${chatProject === project.id ? "active" : ""}" data-sidebar-project="${escapeHtml(project.id)}">
                <span>${escapeHtml(project.name)}</span>
                <small>local</small>
              </button>
            `).join("")}
            ${projectList.length || localProjects.length ? "" : `<p class="sidebar-empty">No projects found.</p>`}
          </div>
        </div>

        <div class="sidebar-section knowledge-section">
          <div class="sidebar-heading">Knowledge</div>
          <div class="tool-list">
            ${collections.slice(0, 5).map(c => `
              <button class="tool-row ${activeCollection === c.id && activeView === "catalog" ? "active" : ""}" data-collection="${c.id}">
                <span>${escapeHtml(c.label)}</span>
                <strong>${countFor(summary, c.id)}</strong>
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
          <span class="dot ${summary?.health.status === "ready" ? "ok" : "warn"}"></span>
          <div>
            <strong>${summary ? `${totalIndexedRecords(summary)} records indexed` : "Loading index"}</strong>
            <small>${escapeHtml(api.baseUrl)}</small>
          </div>
          <button class="settings-button" type="button" aria-label="Console settings">${icon("settings")}</button>
        </div>
      </aside>

      <section class="workspace">
        ${renderWorkspaceHeader()}
        ${activeView === "chat" ? renderChatWorkspace() : activeView === "projects" ? renderProjectsWorkspace() : activeView === "data" ? renderDataWorkspace() : activeView === "runtime" ? renderRuntimeWorkspace() : renderCatalogWorkspace()}
      </section>
    </main>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelector<HTMLButtonElement>("[data-new-chat]")?.addEventListener("click", () => {
    chatInput = "";
    setChatMessages([]);
    activeView = "chat";
    renderShell();
    document.querySelector<HTMLTextAreaElement>("#chatInput")?.focus();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      activeView = (button.dataset.view as "chat" | "projects" | "data" | "catalog" | "runtime") || "chat";
      if (button.dataset.navCollection) activeCollection = button.dataset.navCollection as CollectionName;
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-recent-chat]").forEach(button => {
    button.addEventListener("click", () => {
      activeView = "chat";
      chatInput = button.dataset.recentChat || "";
      renderShell();
      document.querySelector<HTMLTextAreaElement>("#chatInput")?.focus();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-sidebar-project]").forEach(button => {
    button.addEventListener("click", async () => {
      const name = button.dataset.sidebarProject || "";
      chatProject = name;
      if (localProjects.some(project => project.id === name)) {
        selectedProject = "";
        projectDetail = null;
      } else {
        selectedProject = name;
        await loadProjectDetail(name);
      }
      activeView = "chat";
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-collection]").forEach(button => {
    button.addEventListener("click", async () => {
      activeView = "catalog";
      activeCollection = button.dataset.collection as CollectionName;
      searchTerm = "";
      await loadCollection(activeCollection);
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-project-select]").forEach(button => {
    button.addEventListener("click", async () => {
      selectedProject = button.dataset.projectSelect || "";
      chatProject = selectedProject;
      if (localProjects.some(project => project.id === selectedProject)) {
        projectDetail = null;
      } else {
        await loadProjectDetail(selectedProject);
      }
      activeView = "chat";
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-import-project]").forEach(button => {
    button.addEventListener("click", () => {
      void importLocalProject();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-review-local-project]").forEach(button => {
    button.addEventListener("click", () => {
      const project = localProjects.find(item => item.id === button.dataset.reviewLocalProject);
      if (!project) return;
      chatProject = project.id;
      activeView = "chat";
      chatInput = `Review ${project.name} like a senior technical lead. Read the attached local project context, identify the highest leverage improvements, and give me a practical next-action plan.`;
      renderShell();
      document.querySelector<HTMLTextAreaElement>("#chatInput")?.focus();
    });
  });

  document.querySelector<HTMLInputElement>("#search")?.addEventListener("input", event => {
    searchTerm = (event.target as HTMLInputElement).value;
    const list = document.querySelector<HTMLElement>("#catalogList")!;
    list.innerHTML = renderItems(activeItems);
  });

  document.querySelector<HTMLButtonElement>("#routeButton")?.addEventListener("click", async () => {
    const input = document.querySelector<HTMLTextAreaElement>("#routeInput")!.value;
    const result = document.querySelector<HTMLElement>("#routeResult")!;
    result.innerHTML = `<p class="muted">Reading the council map...</p>`;
    try {
      lastRoute = await api.route(input);
      result.innerHTML = renderRoute(lastRoute);
    } catch (error) {
      result.innerHTML = `<pre class="error">${escapeHtml(error)}</pre>`;
    }
  });

  document.querySelector<HTMLSelectElement>("#chatProject")?.addEventListener("change", event => {
    chatProject = (event.target as HTMLSelectElement).value;
    if (localProjects.some(project => project.id === chatProject)) {
      selectedProject = "";
      projectDetail = null;
      renderShell();
      return;
    }
    if (chatProject) {
      void loadProjectDetail(chatProject).then(() => renderShell());
    } else {
      selectedProject = "";
      projectDetail = null;
      renderShell();
    }
  });
  document.querySelector<HTMLSelectElement>("#chatMode")?.addEventListener("change", event => {
    chatMode = (event.target as HTMLSelectElement).value as "orchestrator" | "agent";
    renderShell();
  });
  document.querySelector<HTMLSelectElement>("#chatAgent")?.addEventListener("change", event => {
    selectedAgent = (event.target as HTMLSelectElement).value;
  });
  document.querySelector<HTMLTextAreaElement>("#chatInput")?.addEventListener("input", event => {
    chatInput = (event.target as HTMLTextAreaElement).value;
  });
  document.querySelector<HTMLTextAreaElement>("#chatInput")?.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      void sendChatMessage();
    }
  });
  document.querySelector<HTMLInputElement>("#attachmentInput")?.addEventListener("change", event => {
    void attachFiles((event.target as HTMLInputElement).files);
  });
  document.querySelector<HTMLButtonElement>("#attachButton")?.addEventListener("click", () => {
    document.querySelector<HTMLInputElement>("#attachmentInput")?.click();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-remove-attachment]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeAttachment);
      chatAttachments = chatAttachments.filter((_, itemIndex) => itemIndex !== index);
      renderShell();
    });
  });
  document.querySelector<HTMLButtonElement>("#chatSend")?.addEventListener("click", () => {
    void sendChatMessage();
  });

  document.querySelector<HTMLInputElement>("#runtimeProject")?.addEventListener("input", event => {
    runtimeProject = (event.target as HTMLInputElement).value;
  });
  document.querySelector<HTMLTextAreaElement>("#runtimeTask")?.addEventListener("input", event => {
    runtimeTask = (event.target as HTMLTextAreaElement).value;
  });
  document.querySelectorAll<HTMLButtonElement>("[data-runtime-action]").forEach(button => {
    button.addEventListener("click", async () => {
      const action = button.dataset.runtimeAction || "";
      const output = document.querySelector<HTMLElement>(".runtime-output")!;
      output.innerHTML = `<p class="muted">Running ${escapeHtml(action)}...</p>`;
      try {
        if (action === "context") lastRuntimeAction = await api.runtimeContext(runtimeProject, runtimeTask);
        if (action === "run") lastRuntimeAction = await api.runtimeRun(runtimeProject, runtimeTask);
        if (action === "eval") lastRuntimeAction = await api.runtimeEval(runtime?.latestArtifact);
        if (action === "provider") providerHealth = await api.providerHealth();
        if (action !== "provider") runtime = lastRuntimeAction?.runtime || await api.runtimeLatest();
        output.innerHTML = renderRuntime();
      } catch (error) {
        output.innerHTML = `<pre class="error">${escapeHtml(error)}</pre>`;
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".prompt-chip").forEach(button => {
    button.addEventListener("click", () => {
      chatInput = button.dataset.prompt || "";
      renderShell();
      document.querySelector<HTMLTextAreaElement>("#chatInput")?.focus();
    });
  });
}

function renderWorkspaceHeader() {
  const label = activeView === "chat"
    ? "Improve response flow"
    : activeView === "projects"
      ? "Projects"
      : activeView === "data"
        ? "Data"
        : activeView === "runtime"
          ? "Runtime Workbench"
          : "Knowledge";
  return `
    <header class="workspace-header">
      <div class="workspace-title">
        <h1>${escapeHtml(label)} ${activeView === "chat" ? icon("chevron") : ""}</h1>
        <p>${escapeHtml(headerSubtitle())}</p>
      </div>
      <div class="header-actions">
        <button class="secondary-button share-button" type="button">${icon("share")} Share</button>
        <button class="secondary-button icon-only" type="button" aria-label="More options">${icon("more")}</button>
        <span class="status-pill live"><span class="dot ok"></span>${summary?.health.status === "ready" ? "Live" : "Loading"}</span>
      </div>
    </header>
  `;
}

function headerSubtitle() {
  if (activeView === "chat") return "";
  if (activeView === "projects") return "Choose context first, then bring it into the conversation.";
  if (activeView === "data") return "Inspect Council coverage, runtime activity, provider readiness, and recent operating signals.";
  if (activeView === "runtime") return "Generate context, run the Council loop, and score the result.";
  return collections.find(c => c.id === activeCollection)?.description || "Browse the local Council knowledge base.";
}

function renderChatWorkspace() {
  return `
    <div class="conversation-layout">
      <section class="conversation-main">
        <div class="chat-log" id="chatLog">${renderChatMessages()}</div>
        <form class="composer" onsubmit="return false;">
          <div class="composer-shell">
            <textarea id="chatInput" aria-label="Message AI Council" placeholder="Ask AI Council">${escapeHtml(chatInput)}</textarea>
            ${renderAttachmentTray()}
            <div class="composer-footer">
              <input class="sr-only" id="attachmentInput" type="file" multiple />
              <button class="composer-plus" type="button" id="attachButton" aria-label="Attach files">+</button>
              <div class="composer-controls" aria-label="Conversation context controls">
                <label class="compact-control">
                  <span>Project</span>
                  <select id="chatProject" aria-label="Project context">
                    <option value="">General</option>
                    ${projectOptions().map(project => `<option value="${escapeHtml(project.id)}" ${currentProject() === project.id ? "selected" : ""}>${escapeHtml(project.name)}${project.source === "local" ? " - local" : ""}</option>`).join("")}
                  </select>
                </label>
                <label class="compact-control">
                  <span>Mode</span>
                  <select id="chatMode" aria-label="Conversation mode">
                    <option value="orchestrator" ${chatMode === "orchestrator" ? "selected" : ""}>Orchestrator</option>
                    <option value="agent" ${chatMode === "agent" ? "selected" : ""}>Single agent</option>
                  </select>
                </label>
                <label class="compact-control">
                  <span>Agent</span>
                  <select id="chatAgent" aria-label="Selected agent" ${chatMode === "agent" ? "" : "disabled"}>
                    ${agentOptions.map(agent => `<option value="${escapeHtml(agent.id)}" ${selectedAgent === agent.id ? "selected" : ""}>${escapeHtml(displayTitle(agent))}</option>`).join("")}
                  </select>
                </label>
              </div>
              <button class="mic-button" type="button" aria-label="Voice input">${icon("mic")}</button>
              <button class="send-button" id="chatSend" aria-label="${chatBusy ? "AI Council is thinking" : "Send message"}">${chatBusy ? icon("more") : icon("send")}</button>
            </div>
          </div>
        </form>
      </section>
      <aside class="context-rail">
        <h2>Context Stack</h2>
        ${renderContextStack()}
        ${renderProjectPanel()}
        <div class="mini-panel">
          <h3>Preflight route</h3>
          <textarea id="routeInput">review the repo and recommend the next serious improvement</textarea>
          <button id="routeButton">Route</button>
          <div id="routeResult">${lastRoute ? renderRoute(lastRoute) : ""}</div>
        </div>
      </aside>
    </div>
  `;
}

function renderProjectsWorkspace() {
  return `
    <section class="surface">
      <div class="project-import-panel">
        <div>
          <h2>Add a local project</h2>
          <p>Select a folder from this computer. The browser reads a small set of useful text files and turns them into local-only context for Council review.</p>
        </div>
        <button class="primary-button" data-import-project="true">Choose folder</button>
      </div>
      ${localProjects.length ? `
        <div class="local-project-list">
          ${localProjects.map(project => `
            <article class="local-project-card">
              <div>
                <strong>${escapeHtml(project.name)}</strong>
                <span>${escapeHtml(project.fileCount)} files sampled - imported ${escapeHtml(new Date(project.importedAt).toLocaleString())}</span>
              </div>
              <p>${escapeHtml(project.preview || "No preview available.")}</p>
              <button class="secondary-button" data-review-local-project="${escapeHtml(project.id)}">Review with Council</button>
            </article>
          `).join("")}
        </div>
      ` : ""}
      <div class="project-grid">
        ${projectList.length ? projectList.map(project => `
          <button class="project-tile" data-project-select="${escapeHtml(project.name)}">
            <strong>${escapeHtml(project.name)}</strong>
            <span>${escapeHtml(project.rel)}</span>
            <small>${project.hasMemory ? "Memory available" : "No memory yet"}</small>
          </button>
        `).join("") : `<div class="empty-state">No projects discovered yet.</div>`}
      </div>
    </section>
  `;
}

function renderDataWorkspace() {
  const counts = summary?.counts || {};
  const countEntries = Object.entries(counts).sort((a, b) => Number(b[1]) - Number(a[1]));
  const maxCount = Math.max(1, ...countEntries.map(([, value]) => Number(value || 0)));
  const records = observability?.records || {};
  const runtimeChecks = runtime?.latestEval?.checks || [];
  const passedChecks = runtimeChecks.filter(check => check.passed).length;
  const failedChecks = runtimeChecks.length - passedChecks;
  const providerText = providerHealth?.stdout || providerHealth?.stderr || providerHealth?.error || "Provider health has not been checked yet.";

  return `
    <section class="surface data-surface">
      <div class="data-grid">
        <article class="data-card data-card-large">
          <div class="data-card-heading">
            <div>
              <span>Knowledge coverage</span>
              <h2>${summary ? `${totalIndexedRecords(summary)} indexed records` : "Loading"}</h2>
            </div>
            <strong>${escapeHtml(summary?.health.status || "unknown")}</strong>
          </div>
          <div class="bar-list">
            ${countEntries.map(([key, value]) => `
              <div class="bar-row">
                <span>${escapeHtml(key)}</span>
                <div class="bar-track"><div class="bar-fill" style="width: ${Math.max(4, Math.round((Number(value || 0) / maxCount) * 100))}%"></div></div>
                <strong>${escapeHtml(value)}</strong>
              </div>
            `).join("") || `<p class="muted">No catalog counts loaded yet.</p>`}
          </div>
        </article>

        <article class="data-card">
          <span>Runtime artifact</span>
          <h2>${escapeHtml(runtime?.latestArtifact ? "Available" : "None yet")}</h2>
          <p>${escapeHtml(runtime?.latestArtifact || "Run the Council loop to create an artifact.")}</p>
        </article>

        <article class="data-card">
          <span>Quality score</span>
          <h2>${escapeHtml(runtime?.latestEval?.score ?? "n/a")}</h2>
          <p>${passedChecks} checks passing${failedChecks ? `, ${failedChecks} need attention` : ""}.</p>
        </article>

        <article class="data-card">
          <span>Projects</span>
          <h2>${projectList.length}</h2>
          <p>${projectList.filter(project => project.hasMemory).length} with memory, ${projectList.filter(project => project.hasProjectFile).length} with project files.</p>
        </article>

        <article class="data-card">
          <span>Chat transcript</span>
          <h2>${chatMessages.length}</h2>
          <p>${chatMessages.filter(message => message.role === "user").length} sent by you, ${chatMessages.filter(message => message.role === "assistant").length} Council replies. Stored locally in this browser.</p>
        </article>
      </div>

      <div class="data-columns">
        <article class="data-card">
          <div class="data-card-heading">
            <div>
              <span>Observability</span>
              <h2>Signals</h2>
            </div>
          </div>
          <div class="signal-list">
            ${Object.entries(records).map(([key, value]) => `<div><span>${escapeHtml(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join("") || `<p class="muted">No observability records yet.</p>`}
          </div>
        </article>

        <article class="data-card">
          <div class="data-card-heading">
            <div>
              <span>Provider readiness</span>
              <h2>Local-first</h2>
            </div>
          </div>
          <pre class="compact-output">${escapeHtml(providerText)}</pre>
        </article>
      </div>
    </section>
  `;
}

function renderRuntimeWorkspace() {
  return `
    <section class="surface runtime-surface">
      <div class="runtime-form">
        <label>
          <span>Project</span>
          <input id="runtimeProject" value="${escapeHtml(runtimeProject)}" />
        </label>
        <label>
          <span>Task</span>
          <textarea id="runtimeTask">${escapeHtml(runtimeTask)}</textarea>
        </label>
      </div>
      <div class="button-row">
        <button class="secondary-button" data-runtime-action="context">Generate context</button>
        <button class="primary-button" data-runtime-action="run">Run Council loop</button>
        <button class="secondary-button" data-runtime-action="eval">Score artifact</button>
        <button class="secondary-button" data-runtime-action="provider">Provider health</button>
      </div>
      <div class="runtime-output">${renderRuntime()}</div>
    </section>
  `;
}

function renderCatalogWorkspace() {
  return `
    <section class="surface catalog-surface">
      <div class="toolbar">
        <div>
          <h2>${escapeHtml(collections.find(c => c.id === activeCollection)?.label || activeCollection)}</h2>
          <p>${escapeHtml(collections.find(c => c.id === activeCollection)?.description || "")}</p>
        </div>
        <input id="search" placeholder="Filter current catalog..." value="${escapeHtml(searchTerm)}" />
      </div>
      <section class="metrics">
        ${Object.entries(summary?.counts || {}).map(([key, value]) => `
          <article class="metric-card">
            <span>${escapeHtml(key)}</span>
            <strong>${escapeHtml(value)}</strong>
          </article>
        `).join("")}
      </section>
      <section class="catalog-list" id="catalogList">${renderItems(activeItems)}</section>
    </section>
  `;
}

function renderProjectPanel() {
  const localProject = currentLocalProject();
  if (localProject) {
    return `
      <div class="project-detail">
        <p><strong>${escapeHtml(localProject.name)}</strong></p>
        <p>Local browser context loaded. ${escapeHtml(localProject.fileCount)} files sampled.</p>
        <pre>${escapeHtml(localProject.preview || "No project context available yet.")}</pre>
      </div>
    `;
  }
  if (!selectedProject || !projectDetail) {
    return `<div class="empty-state">Pick a project from the left rail to ground the next answer.</div>`;
  }
  return `
    <div class="project-detail">
      <p><strong>${escapeHtml(selectedProject)}</strong></p>
      <p>${projectDetail.hasMemory ? "Memory is available." : "No memory record yet."} ${projectDetail.hasProjectFile ? "Project file is present." : "Project file is missing."}</p>
      <pre>${escapeHtml(projectDetail.preview || "No project context available yet.")}</pre>
    </div>
  `;
}

function renderContextStack() {
  const agents = chatMode === "agent"
    ? [selectedAgent]
    : ["router", "architect", "builder", "reviewer"];
  const providerReady = providerHealth?.stdout?.includes("ollama: available") || providerHealth?.stdout?.includes("ollama: available/configurable");
  const latestContext = runtime?.latestContext;
  return `
    <div class="context-stack">
      <div class="stack-row">
        <span>Project</span>
        <strong>${escapeHtml(currentProjectLabel())}</strong>
      </div>
      <div class="stack-row">
        <span>Memory</span>
        <strong>${projectDetail?.hasMemory ? "Loaded" : "Not selected"}</strong>
      </div>
      <div class="stack-row">
        <span>Provider</span>
        <strong>${providerReady ? "Ollama ready" : "Check needed"}</strong>
      </div>
      <div class="stack-row">
        <span>Runtime</span>
        <strong>${latestContext?.recommendedWorkflow || "No active pack"}</strong>
      </div>
      <div class="stack-agents">
        ${agents.map(agent => `<span>${escapeHtml(titleLabel(agent))}</span>`).join("")}
      </div>
    </div>
  `;
}

function titleLabel(value: string) {
  return value.split("-").filter(Boolean).map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

async function sendChatMessage() {
  const input = chatInput.trim();
  if (!input || chatBusy) return;
  const outgoingAttachments = [...chatAttachments];
  const prompt = buildPrompt(input);
  chatBusy = true;
  setThinking(true);
  setChatMessages([...chatMessages, { role: "user", text: input, attachments: outgoingAttachments }]);
  chatInput = "";
  chatAttachments = [];
  renderShell();
  const startedAt = Date.now();
  try {
    const response = await api.ask(prompt, apiProjectId(), chatMode === "agent" ? selectedAgent : undefined);
    const elapsed = Date.now() - startedAt;
    if (elapsed < 1200) await wait(1200 - elapsed);
    setChatMessages([...chatMessages, { role: "assistant", text: response.answer, meta: response }]);
  } catch (error) {
    setChatMessages([...chatMessages, { role: "assistant", text: `I could not reach the local Council API.\n\n${String(error)}` }]);
  } finally {
    chatBusy = false;
    setThinking(false);
    renderShell();
    document.querySelector<HTMLTextAreaElement>("#chatInput")?.focus();
  }
}

function renderItems(items: CatalogItem[]) {
  const q = searchTerm.trim().toLowerCase();
  const filtered = q
    ? items.filter(item => JSON.stringify(item).toLowerCase().includes(q))
    : items;

  if (!filtered.length) {
    return `<article class="empty-state">No matching records.</article>`;
  }

  return filtered.slice(0, 120).map(item => `
    <article class="item-card">
      <div class="item-heading">
        <h3>${escapeHtml(displayTitle(item))}</h3>
        <span>${escapeHtml(item.category || item.id)}</span>
      </div>
      <p>${escapeHtml(compactText(item.summary || item.description || item.tags || item.keywords))}</p>
      <div class="pill-row">
        ${(item.skills || item.keywords || item.tags || []).slice(0, 6).map(String).map(pill).join("")}
      </div>
      ${item.rel ? `<code>${escapeHtml(item.rel)}</code>` : ""}
    </article>
  `).join("");
}

function renderRoute(route: RouteResponse) {
  const entries = Object.entries(route.route || {}).filter((entry): entry is [string, CatalogItem[]] => Array.isArray(entry[1]) && entry[1].length > 0);
  return `
    <div class="route-output">
      <p><strong>Next:</strong> ${escapeHtml(route.recommendedNextStep)}</p>
      <div class="route-grid">
        ${entries.slice(0, 4).map(([name, items]) => `
          <div class="route-group">
            <h4>${escapeHtml(name)}</h4>
            ${items.slice(0, 4).map(item => `<div class="route-hit"><strong>${escapeHtml(displayTitle(item))}</strong><span>${escapeHtml(item.score ?? "")}</span></div>`).join("")}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderChatMessages() {
  if (!chatMessages.length) {
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
  return `${chatMessages.map(message => `
    <article class="chat-message ${message.role}">
      ${message.role === "assistant"
        ? `<div class="assistant-head">
            <span class="assistant-mark">${icon("sparkle")}</span>
            <strong>AI Council</strong>
            <span class="thinking-pill">Thinking</span>
            <button class="ghost-icon" type="button" aria-label="More response options">${icon("more")}</button>
          </div>${renderAssistantAnswer(message.text)}`
        : `<div class="user-card">
            <span class="avatar">AM</span>
            <div class="user-message-body">
              <div class="message-role"><strong>You</strong><span>${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></div>
              <p>${escapeHtml(message.text)}</p>
            </div>
          </div>`}
      ${message.role === "user" && message.attachments?.length ? renderMessageAttachments(message.attachments) : ""}
      ${message.meta ? `<div class="message-meta">
        <span>${escapeHtml(message.meta.selectedCouncil)}</span>
        <span>${escapeHtml(message.meta.selectedProvider)}</span>
        <span>${escapeHtml(message.meta.agentsUsed.join(", "))}</span>
      </div>` : ""}
    </article>
  `).join("")}${chatBusy ? renderThinkingState() : ""}`;
}

function renderThinkingState() {
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
      <div class="thinking-steps">
        ${steps.map((step, index) => `
          <span class="${index < thinkingStep ? "done" : index === thinkingStep ? "current" : ""}">
            <b>${escapeHtml(step.label)}</b>
            <small>${escapeHtml(step.detail)}</small>
          </span>
        `).join("")}
      </div>
      <div class="thinking-footer"><span class="dot ok"></span>Working across agents <strong>3 active</strong></div>
    </article>
  `;
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

function renderStaticProgressPanel() {
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

function renderAgentCards() {
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

function renderResponseActions() {
  return `<div class="response-actions">
    <button type="button" aria-label="Helpful">${icon("thumbsUp")}</button>
    <button type="button" aria-label="Copy response">${icon("copy")}</button>
  </div>`;
}

function isDetailSection(key: string) {
  return ["model", "trace", "evidence"].includes(key);
}

function renderAttachmentTray() {
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

async function attachFiles(files: FileList | null) {
  if (!files?.length) return;
  const attachments = await Promise.all(Array.from(files).slice(0, 8).map(fileToAttachment));
  chatAttachments = [...chatAttachments, ...attachments].slice(-12);
  renderShell();
}

async function fileToAttachment(file: File): Promise<ChatAttachment> {
  const text = isReadableFile(file.name, file.type) && file.size <= 750_000
    ? await file.text().catch(() => "")
    : "";
  return {
    name: file.name,
    type: file.type || "unknown",
    size: file.size,
    text: text ? text.slice(0, 5000) : undefined
  };
}

function isReadableFile(name: string, type: string) {
  const readableExtensions = /\.(md|txt|json|csv|ts|tsx|js|jsx|mjs|cjs|html|css|scss|yml|yaml|toml|py|sql)$/i;
  return type.startsWith("text/") || type.includes("json") || readableExtensions.test(name);
}

async function importLocalProject() {
  const picker = (window as unknown as {
    showDirectoryPicker?: () => Promise<{
      name: string;
      entries: () => AsyncIterableIterator<[string, unknown]>;
    }>;
  }).showDirectoryPicker;
  if (!picker) {
    chatInput = "My browser does not support folder selection. I can still attach README, package, source, or config files and ask AI Council to review them.";
    activeView = "chat";
    renderShell();
    return;
  }

  try {
    const directory = await picker();
    const files = await readDirectorySample(directory);
    const project: LocalProject = {
      id: `local:${directory.name}:${Date.now()}`,
      name: directory.name,
      fileCount: files.length,
      files,
      preview: attachmentSummary(files).slice(0, 4000),
      importedAt: new Date().toISOString()
    };
    setLocalProjects([...localProjects.filter(item => item.name !== project.name), project]);
    chatProject = project.id;
    selectedProject = "";
    projectDetail = null;
    activeView = "chat";
    chatInput = `Review ${project.name} like a senior technical lead. Use the local project context and give me accurate feedback, risks, and the next best actions.`;
    renderShell();
  } catch (error) {
    if (String(error).includes("AbortError")) return;
    setChatMessages([...chatMessages, { role: "assistant", text: `I could not import that local project folder.\n\n${String(error)}` }]);
    renderShell();
  }
}

async function readDirectorySample(directory: {
  name: string;
  entries: () => AsyncIterableIterator<[string, unknown]>;
}) {
  const selected: ChatAttachment[] = [];
  const queue: Array<{ prefix: string; handle: any; depth: number }> = [{ prefix: "", handle: directory, depth: 0 }];
  const ignored = /(^|\/)(node_modules|\.git|dist|build|coverage|\.next|\.turbo|storage\/runtime|storage\/observability)(\/|$)/i;
  while (queue.length && selected.length < 28) {
    const { prefix, handle, depth } = queue.shift()!;
    for await (const [name, child] of handle.entries()) {
      const entry = child as any;
      const rel = `${prefix}${name}`;
      if (ignored.test(rel)) continue;
      if (entry.kind === "directory" && depth < 2) {
        queue.push({ prefix: `${rel}/`, handle: entry, depth: depth + 1 });
      }
      if (entry.kind === "file" && isUsefulProjectFile(rel)) {
        const file = await entry.getFile();
        selected.push({
          ...(await fileToAttachment(file)),
          name: rel
        });
      }
      if (selected.length >= 28) break;
    }
  }
  return selected.sort((a, b) => projectFilePriority(a.name) - projectFilePriority(b.name));
}

function isUsefulProjectFile(name: string) {
  if (!isReadableFile(name, "")) return false;
  if (projectFilePriority(name) <= 3) return true;
  return /\.(md|json|ts|tsx|js|mjs|css)$/i.test(name) && !/lock|\.min\.|generated/i.test(name);
}

function projectFilePriority(name: string) {
  const lower = name.toLowerCase();
  if (/(^|\/)(project|readme|agents)\.md$/.test(lower)) return 0;
  if (/(package|pnpm-workspace|tsconfig|vite|next|astro|svelte)\.(json|ts|mjs|js)$/.test(lower)) return 1;
  if (/(src|app|pages)\//.test(lower)) return 2;
  if (/docs?\//.test(lower)) return 3;
  return 4;
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

function renderRuntime() {
  const context = runtime?.latestContext;
  const evalReport = runtime?.latestEval;
  const artifactText = runtime?.artifactText || "";
  const checks = evalReport?.checks || [];
  return `
    <div class="runtime-grid">
      <div class="mini-panel">
        <h3>Latest context</h3>
        <p><strong>Project:</strong> ${escapeHtml(context?.project || "n/a")}</p>
        <p><strong>Workflow:</strong> ${escapeHtml(context?.recommendedWorkflow || "n/a")}</p>
        <p><strong>Engine:</strong> ${escapeHtml(context?.recommendedEngine || "n/a")}</p>
        <p><strong>Agents:</strong> ${escapeHtml((context?.recommendedAgents || []).join(", ") || "n/a")}</p>
      </div>
      <div class="mini-panel">
        <h3>Artifact quality</h3>
        <p><strong>Artifact:</strong> ${escapeHtml(runtime?.latestArtifact || "n/a")}</p>
        <p><strong>Score:</strong> ${escapeHtml(evalReport?.score ?? "n/a")} / threshold ${escapeHtml(evalReport?.threshold ?? "n/a")}</p>
        <div class="check-list">
          ${checks.slice(0, 8).map(check => `<div class="check-row ${check.passed ? "pass" : "fail"}"><span>${check.passed ? "PASS" : "FAIL"}</span>${escapeHtml(check.label)}</div>`).join("") || `<p class="muted">Run artifact scoring to populate checks.</p>`}
        </div>
      </div>
    </div>
    ${lastRuntimeAction ? `<pre class="console-output">${escapeHtml(lastRuntimeAction.command)}\n\n${escapeHtml(lastRuntimeAction.stdout || lastRuntimeAction.stderr || lastRuntimeAction.error || "")}</pre>` : ""}
    ${providerHealth ? `<pre class="console-output">${escapeHtml(providerHealth.command)}\n\n${escapeHtml(providerHealth.stdout || providerHealth.stderr || providerHealth.error || "")}</pre>` : ""}
    <details class="artifact-preview" ${artifactText ? "open" : ""}>
      <summary>Latest runtime artifact preview</summary>
      <pre>${escapeHtml(artifactText || "No runtime artifact has been generated yet.")}</pre>
    </details>
  `;
}

async function loadCollection(collection: CollectionName) {
  const response = await api.catalog(collection);
  activeItems = response.items;
}

async function loadProjectDetail(name: string) {
  if (!name) {
    projectDetail = null;
    selectedProject = "";
    return;
  }
  projectDetail = await api.projectDetail(name);
  selectedProject = projectDetail.name;
}

async function init() {
  app.innerHTML = `<div class="loading">Loading AI Council Console...</div>`;
  try {
    const [summaryResponse, runtimeResponse, projectsResponse, agentsResponse, observabilityResponse, providerHealthResponse] = await Promise.all([
      api.summary(),
      api.runtimeLatest(),
      api.projects(),
      api.catalog("agents"),
      api.observability(),
      api.providerHealth()
    ]);
    summary = summaryResponse;
    runtime = runtimeResponse;
    projectList = projectsResponse.projects;
    agentOptions = agentsResponse.items;
    observability = observabilityResponse;
    providerHealth = providerHealthResponse;
    if (projectList[0]) {
      selectedProject = projectList[0].name;
      chatProject = selectedProject;
      await loadProjectDetail(selectedProject);
    }
    await loadCollection(activeCollection);
    renderShell();
  } catch (error) {
    app.innerHTML = `
      <main class="failure">
        <h1>Console API is not reachable</h1>
        <p>Start the local API first, then reload this page.</p>
        <pre>pnpm dev:api
pnpm dev:web</pre>
        <p class="muted">Configured API: ${escapeHtml(api.baseUrl)}</p>
        <pre class="error">${escapeHtml(error)}</pre>
      </main>
    `;
  }
}

init();
