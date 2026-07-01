import { api } from "./api.js";
import { collections, compactText, countFor, displayTitle } from "./state.js";
import type { AskResponse, CatalogItem, CollectionName, ProjectDetailResponse, ProviderHealthResponse, RouteResponse, RuntimeActionResponse, RuntimeSnapshot, Summary } from "./types.js";

const app = document.querySelector<HTMLDivElement>("#app")!;
let summary: Summary | null = null;
let activeCollection: CollectionName = "agents";
let activeItems: CatalogItem[] = [];
let lastRoute: RouteResponse | null = null;
let runtime: RuntimeSnapshot | null = null;
let lastRuntimeAction: RuntimeActionResponse | null = null;
let providerHealth: ProviderHealthResponse | null = null;
let chatMessages: Array<{ role: "user" | "assistant"; text: string; meta?: AskResponse }> = [];
let chatInput = "What should I improve next in AI Council?";
let chatProject = "";
let chatBusy = false;
let searchTerm = "";
let runtimeProject = "TradeFrame";
let runtimeTask = "review the trading journal MVP architecture";
let activeView: "chat" | "projects" | "catalog" = "chat";
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

function renderShell() {
  app.innerHTML = `
    <header class="hero">
      <div>
        <p class="eyebrow">AI Council v2 · Codex-like workspace</p>
        <h1>AI Council Console</h1>
        <p class="lede">Start a new conversation, route work through the orchestrator, switch to a single agent, inspect projects, or browse the Council catalog.</p>
      </div>
      <div class="hero-card">
        <div class="status-row"><span class="dot ${summary?.health.status === "ready" ? "ok" : "warn"}"></span>${escapeHtml(summary?.health.status || "loading")}</div>
        <strong>${summary ? totalIndexedRecords(summary) : "—"}</strong>
        <span>indexed records</span>
        <small>API: ${escapeHtml(api.baseUrl)}</small>
      </div>
    </header>

    <main class="layout">
      <aside class="sidebar">
        <div class="panel-title">Workspace</div>
        <nav class="nav-list">
          <button class="nav-item ${activeView === "chat" ? "active" : ""}" data-view="chat">New Chat</button>
          <button class="nav-item ${activeView === "projects" ? "active" : ""}" data-view="projects">Projects</button>
          <button class="nav-item ${activeView === "catalog" ? "active" : ""}" data-view="catalog">Catalog</button>
        </nav>
        <div class="panel-title">Catalog</div>
        <nav class="nav-list">
          ${collections.map(c => `
            <button class="nav-item ${activeCollection === c.id && activeView === "catalog" ? "active" : ""}" data-collection="${c.id}">
              <span>${escapeHtml(c.label)}</span>
              <strong>${countFor(summary, c.id)}</strong>
            </button>
          `).join("")}
        </nav>
        <div class="help-card">
          <strong>Run locally</strong>
          <code>pnpm dev:api</code>
          <code>pnpm dev:web</code>
        </div>
      </aside>

      <section class="content">
        ${activeView === "chat" ? renderChatWorkspace() : activeView === "projects" ? renderProjectsWorkspace() : renderCatalogWorkspace()}
      </section>
    </main>
  `;

  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      activeView = (button.dataset.view as "chat" | "projects" | "catalog") || "chat";
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
      await loadProjectDetail(selectedProject);
      renderShell();
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
    result.innerHTML = `<p class="muted">Routing...</p>`;
    try {
      lastRoute = await api.route(input);
      result.innerHTML = renderRoute(lastRoute);
    } catch (error) {
      result.innerHTML = `<pre class="error">${escapeHtml(error)}</pre>`;
    }
  });

  document.querySelector<HTMLSelectElement>("#chatProject")?.addEventListener("change", event => {
    chatProject = (event.target as HTMLSelectElement).value;
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
}

function renderChatWorkspace() {
  return `
    <section class="card chat-card">
      <div class="section-heading">
        <div>
          <h2>New Chat</h2>
          <p>Start a conversation with the orchestrator or a specific agent. You can keep it project-scoped or leave it general.</p>
        </div>
        <span class="result-badge neutral">${chatMessages.length ? `${chatMessages.length} messages` : "Ready"}</span>
      </div>
      <div class="chat-composer compact">
        <label>
          <span>Project</span>
          <select id="chatProject">
            <option value="">General / no project</option>
            ${projectList.map(project => `<option value="${escapeHtml(project.name)}" ${chatProject === project.name ? "selected" : ""}>${escapeHtml(project.name)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Mode</span>
          <select id="chatMode">
            <option value="orchestrator" ${chatMode === "orchestrator" ? "selected" : ""}>Orchestrator</option>
            <option value="agent" ${chatMode === "agent" ? "selected" : ""}>Single agent</option>
          </select>
        </label>
        <label>
          <span>Agent</span>
          <select id="chatAgent" ${chatMode === "agent" ? "" : "disabled"}>
            ${agentOptions.map(agent => `<option value="${escapeHtml(agent.id)}" ${selectedAgent === agent.id ? "selected" : ""}>${escapeHtml(displayTitle(agent))}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="chat-log" id="chatLog">${renderChatMessages()}</div>
      <label>
        <span>Message</span>
        <textarea id="chatInput">${escapeHtml(chatInput)}</textarea>
      </label>
      <button class="action-button primary" id="chatSend">${chatBusy ? "Thinking..." : "Send"}</button>
    </section>

    <section class="card project-card">
      <div class="section-heading">
        <div>
          <h2>Project workspace</h2>
          <p>${selectedProject ? `Viewing ${selectedProject}.` : "Choose a project to inspect its context and notes."}</p>
        </div>
        <button class="action-button" data-view="projects">Open projects</button>
      </div>
      ${renderProjectPanel()}
    </section>

    <section class="card route-card">
      <div>
        <h2>Route a task</h2>
        <p>Use the Council router to select agents, skills, decision engines, workflows, templates, providers, and gates.</p>
      </div>
      <textarea id="routeInput">build an AI trading journal feature with risk dashboard</textarea>
      <button id="routeButton">Route through Council</button>
      <div id="routeResult">${lastRoute ? renderRoute(lastRoute) : ""}</div>
    </section>

    <section class="card runtime-card">
      <div class="section-heading">
        <div>
          <h2>Runtime Workbench</h2>
          <p>Generate context, run the loop, score artifacts, and inspect provider health.</p>
        </div>
        <span class="result-badge ${runtime?.latestEval?.passed ? "pass" : "neutral"}">${runtime?.latestEval ? `${runtime.latestEval.passed ? "PASS" : "CHECK"} ${runtime.latestEval.score ?? "n/a"}` : "No eval yet"}</span>
      </div>
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
        <button class="action-button" data-runtime-action="context">Generate context</button>
        <button class="action-button primary" data-runtime-action="run">Run Council loop</button>
        <button class="action-button" data-runtime-action="eval">Score artifact</button>
        <button class="action-button" data-runtime-action="provider">Provider health</button>
      </div>
      <div class="runtime-output">${renderRuntime()}</div>
    </section>
  `;
}

function renderProjectsWorkspace() {
  return `
    <section class="card project-list-card">
      <div class="section-heading">
        <div>
          <h2>Projects</h2>
          <p>Select a project to inspect its workspace details and context.</p>
        </div>
        <button class="action-button" data-view="chat">Back to chat</button>
      </div>
      <div class="project-grid">
        ${projectList.length ? projectList.map(project => `
          <button class="project-card" data-project-select="${escapeHtml(project.name)}">
            <strong>${escapeHtml(project.name)}</strong>
            <span>${escapeHtml(project.rel)}</span>
            <small>${project.hasMemory ? "Has memory" : "No memory yet"}</small>
          </button>
        `).join("") : `<div class="empty-state">No projects discovered yet.</div>`}
      </div>
    </section>
    <section class="card project-card">
      <div class="section-heading">
        <div>
          <h2>${selectedProject || "Project detail"}</h2>
          <p>${projectDetail ? "Loaded from local project files and memory." : "Choose a project to inspect its details."}</p>
        </div>
      </div>
      ${renderProjectPanel()}
    </section>
  `;
}

function renderCatalogWorkspace() {
  return `
    <section class="toolbar card">
      <div>
        <h2>${escapeHtml(collections.find(c => c.id === activeCollection)?.label || activeCollection)}</h2>
        <p>${escapeHtml(collections.find(c => c.id === activeCollection)?.description || "")}</p>
      </div>
      <input id="search" placeholder="Filter current catalog..." value="${escapeHtml(searchTerm)}" />
    </section>
    <section class="grid metrics">
      ${Object.entries(summary?.counts || {}).map(([key, value]) => `
        <article class="metric-card">
          <span>${escapeHtml(key)}</span>
          <strong>${escapeHtml(value)}</strong>
        </article>
      `).join("")}
    </section>
    <section class="catalog-list" id="catalogList">${renderItems(activeItems)}</section>
  `;
}

function renderProjectPanel() {
  if (!selectedProject || !projectDetail) {
    return `<div class="empty-state">Select a project to see its preview and context.</div>`;
  }
  return `
    <div class="project-detail">
      <p><strong>Path:</strong> ${escapeHtml(projectDetail.rel || "n/a")}</p>
      <p><strong>Memory:</strong> ${projectDetail.hasMemory ? "Available" : "Not yet initialized"}</p>
      <p><strong>Project file:</strong> ${projectDetail.hasProjectFile ? "Present" : "Missing"}</p>
      <pre>${escapeHtml(projectDetail.preview || "No project context available yet.")}</pre>
    </div>
  `;
}

async function sendChatMessage() {
  const input = chatInput.trim();
  if (!input || chatBusy) return;
  chatBusy = true;
  chatMessages = [...chatMessages, { role: "user", text: input }];
  chatInput = "";
  renderShell();
  try {
    const response = await api.ask(input, chatProject.trim() || undefined, chatMode === "agent" ? selectedAgent : undefined);
    chatMessages = [...chatMessages, { role: "assistant", text: response.answer, meta: response }];
  } catch (error) {
    chatMessages = [...chatMessages, { role: "assistant", text: `Request failed: ${String(error)}` }];
  } finally {
    chatBusy = false;
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
    return `<article class="empty">No matching records.</article>`;
  }

  return filtered.slice(0, 120).map(item => `
    <article class="card item-card">
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
      <p><strong>Request:</strong> ${escapeHtml(route.request)}</p>
      <p><strong>Next step:</strong> ${escapeHtml(route.recommendedNextStep)}</p>
      <div class="route-grid">
        ${entries.map(([name, items]) => `
          <div class="mini-panel">
            <h4>${escapeHtml(name)}</h4>
            ${items.slice(0, 5).map(item => `<div class="route-hit"><strong>${escapeHtml(displayTitle(item))}</strong><span>score ${escapeHtml(item.score ?? "")}</span></div>`).join("")}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderChatMessages() {
  if (!chatMessages.length) {
    return `<div class="empty-state">No conversation yet. Start a request for architecture, coding, reviews, or project planning.</div>`;
  }
  return chatMessages.map(message => `
    <article class="chat-message ${message.role}">
      <div class="message-role">${message.role === "user" ? "You" : "AI Council"}</div>
      <pre>${escapeHtml(message.text)}</pre>
      ${message.meta ? `<div class="message-meta">
        <span>Council: ${escapeHtml(message.meta.selectedCouncil)}</span>
        <span>Provider: ${escapeHtml(message.meta.selectedProvider)}</span>
        <span>Agents: ${escapeHtml(message.meta.agentsUsed.join(", "))}</span>
      </div>` : ""}
    </article>
  `).join("");
}

function renderRuntime() {
  const context = runtime?.latestContext;
  const evalReport = runtime?.latestEval;
  const artifactText = runtime?.artifactText || "";
  const checks = evalReport?.checks || [];
  return `
    <div class="runtime-grid">
      <div class="mini-panel">
        <h4>Latest context</h4>
        <p><strong>Project:</strong> ${escapeHtml(context?.project || "n/a")}</p>
        <p><strong>Workflow:</strong> ${escapeHtml(context?.recommendedWorkflow || "n/a")}</p>
        <p><strong>Engine:</strong> ${escapeHtml(context?.recommendedEngine || "n/a")}</p>
        <p><strong>Agents:</strong> ${escapeHtml((context?.recommendedAgents || []).join(", ") || "n/a")}</p>
      </div>
      <div class="mini-panel">
        <h4>Artifact quality</h4>
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
    const [summaryResponse, runtimeResponse, projectsResponse, agentsResponse] = await Promise.all([
      api.summary(),
      api.runtimeLatest(),
      api.projects(),
      api.catalog("agents")
    ]);
    summary = summaryResponse;
    runtime = runtimeResponse;
    projectList = projectsResponse.projects;
    agentOptions = agentsResponse.items;
    if (projectList[0]) {
      selectedProject = projectList[0].name;
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
