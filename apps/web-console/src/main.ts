import { api } from "./api.js";
import { collections, compactText, displayTitle } from "./state.js";
import { renderComposer } from "./components/Composer.js";
import { renderChatMessages } from "./components/ConversationStream.js";
import { renderHeaderPanels } from "./components/HeaderPanels.js";
import { renderRuntime, renderRuntimeWorkspace as renderRuntimeWorkbench } from "./components/RuntimeWorkbench.js";
import { renderSidebar } from "./components/Sidebar.js";
import { renderWorkspaceHeader as renderWorkspaceHeaderComponent } from "./components/WorkspaceHeader.js";
import type { ChatAttachment, ChatMessage, LocalProject, NavItem } from "./state/console-state.js";
import type { CatalogItem, CollectionName, ObservabilityResponse, ProjectDetailResponse, ProviderHealthResponse, RouteResponse, RuntimeActionResponse, RuntimeSnapshot, Summary } from "./types.js";
import { copyTextToClipboard } from "./ui/copy.js";
import { escapeHtml, formatBytes, pill } from "./ui/escape.js";
import { icon } from "./ui/icons.js";

const app = document.querySelector<HTMLDivElement>("#app")!;
const CHAT_STORAGE_KEY = "aiCouncilChatMessages";
const LOCAL_PROJECTS_STORAGE_KEY = "aiCouncilLocalProjects";

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
let sidebarCollapsed = false;
let settingsOpen = false;
let shareOpen = false;
let moreMenuOpen = false;
let actionNotice = "";

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

function closePanels(except?: "settings" | "share" | "more") {
  settingsOpen = except === "settings" ? settingsOpen : false;
  shareOpen = except === "share" ? shareOpen : false;
  moreMenuOpen = except === "more" ? moreMenuOpen : false;
}

function setActionNotice(message: string) {
  actionNotice = message;
  window.setTimeout(() => {
    if (actionNotice === message) {
      actionNotice = "";
      renderShell();
    }
  }, 2600);
}

function latestAssistantAnswer() {
  return [...chatMessages].reverse().find(message => message.role === "assistant")?.text || "";
}

async function copyText(text: string, success: string) {
  if (!text.trim()) {
    setActionNotice("Nothing available to copy yet.");
    renderShell();
    return;
  }
  try {
    const copied = await copyTextToClipboard(text);
    setActionNotice(copied ? success : "Copy was blocked by the browser. Select the text and copy manually.");
  } catch {
    setActionNotice("Copy was blocked by the browser. Select the text and copy manually.");
  }
  renderShell();
}

function exportChatJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    project: currentProjectLabel(),
    apiBase: api.baseUrl,
    messages: chatMessages
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ai-council-chat-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  moreMenuOpen = false;
  setActionNotice("Chat JSON exported.");
  renderShell();
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

function renderShell() {
  app.innerHTML = `
    <main class="app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}">
      ${renderSidebar({
        activeCollection,
        activeView,
        apiBase: api.baseUrl,
        chatProject,
        localProjects,
        navItems,
        projectList,
        recentChats,
        selectedProject,
        sidebarCollapsed,
        settingsOpen,
        summary,
        totalRecords: summary ? totalIndexedRecords(summary) : 0
      })}

      <section class="workspace">
        ${renderWorkspaceHeader()}
        ${activeView === "chat" ? renderChatWorkspace() : activeView === "projects" ? renderProjectsWorkspace() : activeView === "data" ? renderDataWorkspace() : activeView === "runtime" ? renderRuntimeWorkbench({ lastRuntimeAction, providerHealth, runtime, runtimeProject, runtimeTask }) : renderCatalogWorkspace()}
      </section>
    </main>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelector<HTMLButtonElement>("[data-sidebar-toggle]")?.addEventListener("click", () => {
    sidebarCollapsed = !sidebarCollapsed;
    closePanels();
    renderShell();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-open-settings]").forEach(button => {
    button.addEventListener("click", () => {
      settingsOpen = !settingsOpen;
      closePanels(settingsOpen ? "settings" : undefined);
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-share]").forEach(button => {
    button.addEventListener("click", () => {
      shareOpen = !shareOpen;
      closePanels(shareOpen ? "share" : undefined);
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-more-menu]").forEach(button => {
    button.addEventListener("click", () => {
      moreMenuOpen = !moreMenuOpen;
      closePanels(moreMenuOpen ? "more" : undefined);
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-copy-url]").forEach(button => {
    button.addEventListener("click", () => {
      void copyText(window.location.href, "Local console URL copied.");
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-clear-chat]").forEach(button => {
    button.addEventListener("click", () => {
      setChatMessages([]);
      chatInput = "";
      moreMenuOpen = false;
      setActionNotice("Chat cleared.");
      renderShell();
      document.querySelector<HTMLTextAreaElement>("#chatInput")?.focus();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-export-chat]").forEach(button => {
    button.addEventListener("click", () => exportChatJson());
  });

  document.querySelectorAll<HTMLButtonElement>("[data-copy-latest-answer]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      void copyText(latestAssistantAnswer(), "Latest Council answer copied.");
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-feedback]").forEach(button => {
    button.addEventListener("click", () => {
      setActionNotice("Feedback saved for this session.");
      renderShell();
    });
  });

  document.querySelector<HTMLButtonElement>("[data-new-chat]")?.addEventListener("click", () => {
    closePanels();
    chatInput = "";
    setChatMessages([]);
    activeView = "chat";
    renderShell();
    document.querySelector<HTMLTextAreaElement>("#chatInput")?.focus();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      closePanels();
      activeView = (button.dataset.view as "chat" | "projects" | "data" | "catalog" | "runtime") || "chat";
      if (button.dataset.navCollection) activeCollection = button.dataset.navCollection as CollectionName;
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-recent-chat]").forEach(button => {
    button.addEventListener("click", () => {
      closePanels();
      activeView = "chat";
      chatInput = button.dataset.recentChat || "";
      renderShell();
      document.querySelector<HTMLTextAreaElement>("#chatInput")?.focus();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-sidebar-project]").forEach(button => {
    button.addEventListener("click", async () => {
      closePanels();
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
      closePanels();
      activeView = "catalog";
      activeCollection = button.dataset.collection as CollectionName;
      searchTerm = "";
      await loadCollection(activeCollection);
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-project-select]").forEach(button => {
    button.addEventListener("click", async () => {
      closePanels();
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
      closePanels();
      void importLocalProject();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-review-local-project]").forEach(button => {
    button.addEventListener("click", () => {
      closePanels();
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
        output.innerHTML = renderRuntime({ lastRuntimeAction, providerHealth, runtime });
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
  return renderWorkspaceHeaderComponent({
    activeCollection,
    activeView,
    moreMenuOpen,
    panelsHtml: renderHeaderPanels({
      actionNotice,
      apiBase: api.baseUrl,
      currentUrl: window.location.href,
      hasLatestAnswer: Boolean(latestAssistantAnswer()),
      moreMenuOpen,
      providerHealth,
      recordCount: summary ? totalIndexedRecords(summary) : 0,
      settingsOpen,
      shareOpen,
      summary
    }),
    shareOpen,
    summary
  });
}

function renderChatWorkspace() {
  return `
    <div class="conversation-layout">
      <section class="conversation-main">
        <div class="chat-log" id="chatLog">${renderChatMessages({ chatBusy, chatMessages, thinkingStartedAt, thinkingStep })}</div>
        ${renderComposer({
          agentOptions,
          chatAttachments,
          chatBusy,
          chatInput,
          chatMode,
          currentProject: currentProject(),
          projectOptions: projectOptions(),
          selectedAgent
        })}
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
