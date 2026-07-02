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

function renderShell() {
  app.innerHTML = `
    <main class="app-shell">
      <aside class="app-sidebar">
        <div class="brand-block">
          <div class="brand-mark">AC</div>
          <div>
            <strong>AI Council</strong>
            <span>${summary?.health.status === "ready" ? "Ready" : "Local console"}</span>
          </div>
        </div>

        <button class="new-chat-button" data-new-chat="true">New chat</button>

        <nav class="primary-nav">
          <button class="nav-row ${activeView === "chat" ? "active" : ""}" data-view="chat">Conversation</button>
          <button class="nav-row ${activeView === "projects" ? "active" : ""}" data-view="projects">Projects</button>
          <button class="nav-row ${activeView === "data" ? "active" : ""}" data-view="data">Data</button>
          <button class="nav-row ${activeView === "runtime" ? "active" : ""}" data-view="runtime">Runtime</button>
          <button class="nav-row ${activeView === "catalog" ? "active" : ""}" data-view="catalog">Knowledge</button>
        </nav>

        <div class="sidebar-section">
          <div class="sidebar-heading">Projects</div>
          <button class="sidebar-import" data-import-project="true">Add local project</button>
          <div class="thread-list">
            ${projectList.slice(0, 7).map(project => `
              <button class="thread-row ${chatProject === project.name || selectedProject === project.name ? "active" : ""}" data-sidebar-project="${escapeHtml(project.name)}">
                <span>${escapeHtml(project.name)}</span>
                <small>${project.hasMemory ? "memory" : "new"}</small>
              </button>
            `).join("")}
            ${localProjects.map(project => `
              <button class="thread-row ${chatProject === project.id ? "active" : ""}" data-sidebar-project="${escapeHtml(project.id)}">
                <span>${escapeHtml(project.name)}</span>
                <small>local</small>
              </button>
            `).join("")}
            ${projectList.length || localProjects.length ? "" : `<p class="sidebar-empty">No projects found.</p>`}
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-heading">Knowledge</div>
          <div class="tool-list">
            ${collections.slice(0, 8).map(c => `
              <button class="tool-row ${activeCollection === c.id && activeView === "catalog" ? "active" : ""}" data-collection="${c.id}">
                <span>${escapeHtml(c.label)}</span>
                <strong>${countFor(summary, c.id)}</strong>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="sidebar-status">
          <span class="dot ${summary?.health.status === "ready" ? "ok" : "warn"}"></span>
          <div>
            <strong>${summary ? `${totalIndexedRecords(summary)} records indexed` : "Loading index"}</strong>
            <small>${escapeHtml(api.baseUrl)}</small>
          </div>
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
      renderShell();
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
    ? "Conversation"
    : activeView === "projects"
      ? "Projects"
      : activeView === "data"
        ? "Data"
        : activeView === "runtime"
          ? "Runtime Workbench"
          : "Knowledge";
  return `
    <header class="workspace-header">
      <div>
        <h1>${escapeHtml(label)}</h1>
        <p>${escapeHtml(headerSubtitle())}</p>
      </div>
      <div class="header-actions">
        <span class="context-pill">${escapeHtml(currentProjectLabel())}</span>
        <span class="status-pill">${summary?.health.status || "loading"}</span>
        <button class="secondary-button" data-view="runtime">Provider check</button>
      </div>
    </header>
  `;
}

function headerSubtitle() {
  if (activeView === "chat") return currentProject() ? `Grounded in ${currentProjectLabel()}. AI Council will route, read context, ask the local model, then synthesize.` : "Start with a question, decision, review, or plan. The Council will show how it is thinking.";
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
            <textarea id="chatInput" aria-label="Message AI Council" placeholder="Ask AI Council...">${escapeHtml(chatInput)}</textarea>
            ${renderAttachmentTray()}
            <div class="composer-footer">
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
              <input class="sr-only" id="attachmentInput" type="file" multiple />
              <button class="icon-button" type="button" id="attachButton" aria-label="Attach files">+</button>
              <button class="send-button" id="chatSend">${chatBusy ? "Thinking" : "Send"}</button>
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
      <div class="message-role">${message.role === "user" ? "You" : "AI Council"}</div>
      ${message.role === "assistant" ? renderAssistantAnswer(message.text) : `<pre>${escapeHtml(message.text)}</pre>`}
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
    { label: "Route", detail: "Choosing council and agents" },
    { label: "Read", detail: "Loading project memory" },
    { label: "Model", detail: "Asking the selected provider" },
    { label: "Shape", detail: "Turning output into a usable answer" }
  ];
  const active = steps[Math.min(thinkingStep, steps.length - 1)];
  const elapsed = thinkingStartedAt ? Math.max(1, Math.round((Date.now() - thinkingStartedAt) / 1000)) : 1;
  return `
    <article class="thinking-card" aria-live="polite" aria-label="AI Council is thinking">
      <div class="thinking-head">
        <div class="thinking-mark" aria-hidden="true"><span></span></div>
        <div>
          <strong>${escapeHtml(active.detail)}</strong>
          <p>${escapeHtml(currentProjectLabel())} - ${elapsed}s</p>
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
    </article>
  `;
}

function renderAssistantAnswer(text: string) {
  const sections = parseAnswerSections(text);
  if (sections.length < 2) {
    return `<pre>${escapeHtml(text)}</pre>`;
  }
  return `
    <div class="answer-card">
      ${sections.map(section => `
        ${isDetailSection(section.key)
          ? `<details class="answer-details ${section.key}">
              <summary>View ${escapeHtml(section.label.toLowerCase())}</summary>
              <p>${escapeHtml(cleanAnswerText(section.body))}</p>
            </details>`
          : `<section class="answer-section ${section.key}">
              <h3>${escapeHtml(section.label)}</h3>
              <p>${escapeHtml(cleanAnswerText(section.body))}</p>
            </section>`}
      `).join("")}
    </div>
  `;
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
    ["Next move", "next"],
    ["Risks", "risks"],
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
