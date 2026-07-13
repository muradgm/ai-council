import { createServer, IncomingMessage, ServerResponse } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { Orchestrator } from "../../../packages/ai-core/src/index.js";
import { ProviderRegistry } from "../../../packages/ai-providers/src/index.js";
import { buildRepoReviewContext } from "./repo-context.js";
import type { CouncilResponse, CouncilResponseEvent } from "../../../packages/shared/src/index.js";

const root = process.cwd();
const orchestrator = new Orchestrator();
const providerRegistry = new ProviderRegistry();
const port = Number(process.env.AI_COUNCIL_API_PORT || 3333);

function json(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.end(JSON.stringify(payload, null, 2));
}

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("error", reject);
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch (error) { reject(error); }
    });
  });
}

function exists(rel: string) { return fs.existsSync(path.join(root, rel)); }
function readText(rel: string, fallback = "") {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return fallback;
  return fs.readFileSync(file, "utf8");
}
function readJson(rel: string, fallback: any = null) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return fallback;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}
function listDirs(rel: string) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort();
}
function dirsWithMarker(rel: string, marker: string) {
  return listDirs(rel).filter(name => fs.existsSync(path.join(root, rel, name, marker)));
}
function loadCollection(rel: string, marker: string, manifest: string) {
  return dirsWithMarker(rel, marker).map(name => {
    const data = readJson(`${rel}/${name}/${manifest}`, { name, id: name });
    return { id: name, rel: `${rel}/${name}`, ...data };
  });
}
function providers() {
  return readJson("packages/ai-providers/providers.index.json", { providers: [] }).providers || [];
}
function toolContracts() {
  return loadCollection("packages/tool-contracts/contracts", "TOOL.md", "tool.json");
}
function governanceCapabilities() {
  return loadCollection("packages/governance/capabilities", "CAPABILITY.md", "capability.json");
}
function projectPacks() {
  const index = readJson("packages/project-packs/project-packs.index.json", { packs: [] });
  return (index.packs || []).map((p: any) => ({ id: p.name, name: p.name, title: p.title, category: "project-pack", summary: p.wedge, rel: `packages/project-packs/${p.name}`, ...p }));
}
function projects() {
  const projectDirs = listDirs("projects");
  const memoryDirs = listDirs("storage/memory/projects");
  return Array.from(new Set([...projectDirs, ...memoryDirs])).sort().map(name => ({
    name,
    rel: exists(`projects/${name}`) ? `projects/${name}` : `storage/memory/projects/${name}`,
    hasMemory: exists(`storage/memory/projects/${name}/project-context.md`),
    hasProjectFile: exists(`projects/${name}/PROJECT.md`) || exists(`projects/${name}/README.md`)
  }));
}
function allCollections() {
  return {
    skills: loadCollection("packages/skills", "SKILL.md", "skill.json"),
    agents: loadCollection("packages/senior-agents", "AGENT.md", "agent.json"),
    engines: loadCollection("packages/decision-engines", "ENGINE.md", "engine.json"),
    workflows: loadCollection("packages/workflows", "WORKFLOW.md", "workflow.json"),
    templates: loadCollection("packages/templates/deliverables", "TEMPLATE.md", "template.json"),
    evalSuites: loadCollection("packages/evals/suites", "SUITE.md", "suite.json"),
    providers: providers().map((p: any) => ({ id: p.id, name: p.name, title: p.name, category: p.tier, summary: (p.strengths || []).join(", "), ...p })),
    toolContracts: toolContracts(),
    governance: governanceCapabilities(),
    projectPacks: projectPacks(),
    projects: projects().map(p => ({ id: p.name, title: p.name, category: "project", summary: p.hasMemory ? "Project memory is available." : "No memory record yet.", ...p }))
  };
}
function counts() {
  const c = allCollections();
  return Object.fromEntries(Object.entries(c).map(([key, value]) => [key, value.length]));
}
function scoreItem(item: any, request: string) {
  const hay = [item.id, item.name, item.title, item.category, item.summary, item.description, ...(item.keywords || []), ...(item.tags || []), ...(item.skills || []), ...(item.models || [])]
    .filter(Boolean).join(" ").toLowerCase();
  const words = String(request || "").toLowerCase().split(/[^a-z0-9+#.]+/).filter(w => w.length > 2);
  let score = 0;
  for (const word of words) {
    if (hay.includes(word)) score += 1;
    if (hay.includes(word.replace(/s$/, ""))) score += 0.25;
  }
  const phrase = request.toLowerCase();
  const boosts: Array<[string[], string[], number]> = [
    [["trading", "forex", "risk", "journal", "backtest"], ["trading", "forex", "risk", "quant", "portfolio", "finance"], 8],
    [["react", "frontend", "dashboard", "ui"], ["react", "frontend", "ui", "design-system", "product"], 6],
    [["brand", "logo", "identity", "naming"], ["brand", "branding", "logo", "naming", "typography"], 6],
    [["architecture", "database", "api", "security"], ["architecture", "backend", "database", "security", "api"], 6],
    [["codex", "context", "memory", "orchestrator"], ["codex", "memory", "orchestrator", "workflow", "documentation"], 7]
  ];
  for (const [triggers, targets, amount] of boosts) {
    if (triggers.some(t => phrase.includes(t)) && targets.some(t => hay.includes(t))) score += amount;
  }
  return score;
}
function route(input: string) {
  const collections = allCollections();
  const routed: Record<string, any[]> = {};
  for (const [key, items] of Object.entries(collections)) {
    routed[key] = (items as any[])
      .map(item => ({ ...item, score: scoreItem(item, input) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, 6);
  }
  return routed;
}
function latestRecords(rel: string, limit = 5) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full)
    .filter(file => file.endsWith(".json"))
    .map(file => ({ file, full: path.join(full, file), mtime: fs.statSync(path.join(full, file)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, limit)
    .map(({ file, full }) => ({ file, data: readJson(path.relative(root, full), {}) }));
}
function runScript(script: string, args: string[] = []) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], {
    cwd: root,
    encoding: "utf8",
    shell: false
  });
  const stdout = result.stdout?.trim() || "";
  const stderr = result.stderr?.trim() || "";
  return {
    ok: result.status === 0,
    status: result.status,
    command: `node scripts/${script}${args.length ? ` ${args.map(arg => JSON.stringify(arg)).join(" ")}` : ""}`,
    stdout,
    stderr,
    error: result.error?.message
  };
}
function latestRuntimeArtifact() {
  const dir = path.join(root, "storage/runtime/runs");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(file => file.endsWith(".md"))
    .map(file => ({ file, full: path.join(dir, file), mtime: fs.statSync(path.join(dir, file)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files[0] || null;
}
function runtimeSnapshot() {
  const artifact = latestRuntimeArtifact();
  const artifactRel = artifact ? path.relative(root, artifact.full).replaceAll(path.sep, "/") : null;
  return {
    generatedAt: new Date().toISOString(),
    latestArtifact: artifactRel,
    artifactText: artifactRel ? readText(artifactRel).slice(0, 8000) : "",
    latestEval: readJson("storage/evals/latest-runtime-artifact-report.json", null),
    latestContext: readJson("storage/runtime/cache/latest-runtime-context.json", null)
  };
}

function projectContextFor(name: string | undefined) {
  if (!name) return "";
  const candidates = [
    `projects/${name}/PROJECT.md`,
    `projects/${name}/README.md`,
    `storage/memory/projects/${name}/project-context.md`,
    `storage/memory/projects/${name}/project-pack.md`
  ];
  const sections = candidates
    .map(candidate => ({ candidate, text: exists(candidate) ? readText(candidate).trim() : "" }))
    .filter(item => item.text)
    .slice(0, 3)
    .map(item => `Source: ${item.candidate}\n${item.text.slice(0, 1800)}`);
  return sections.join("\n\n---\n\n");
}

function isCouncilContextRequest(input: string) {
  return /\b(repo|repository|codebase|review|architecture|runtime|orchestrator|agent|provider|validation|eval|console|api|security|qa|docs|documentation|project|memory|github|push|implement|build|fix|debug|bug|ui|ux|frontend|backend|database|governance)\b/i.test(input);
}

function shouldAttachProjectContext(input: string, projectId: string | undefined) {
  return Boolean(projectId) && isCouncilContextRequest(input);
}

function isDirectGeneralRequest(input: string) {
  return !isCouncilContextRequest(input);
}

function weatherLocationFrom(input: string) {
  const text = input.trim();
  if (!/\b(weather|temperature|forecast|rain|snow|wind|sunny|cloudy)\b/i.test(text)) return null;
  const match = text.match(/\b(?:in|for|at|near)\s+([a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s.'-]{1,60})(?:[?.!,]|$)/i)
    || text.match(/^([a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s.'-]{1,60})\s+weather\b/i);
  const location = match?.[1]?.replace(/\b(today|tomorrow|now|please)\b/gi, "").trim();
  return location || null;
}

function weatherCodeLabel(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather update";
}

function directEvent(label: string, detail: string, status: CouncilResponseEvent["status"] = "complete"): CouncilResponseEvent {
  const createdAt = new Date().toISOString();
  return {
    id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${createdAt}`,
    type: label === "Final answer" ? "final_answer_streamed" : "context_read",
    label,
    detail,
    status,
    tone: "blue",
    createdAt
  };
}

function configuredProviderIds() {
  const envByProvider: Record<string, string[]> = {
    "gemini-free": ["GEMINI_API_KEY"],
    mistral: ["MISTRAL_API_KEY"],
    deepseek: ["DEEPSEEK_API_KEY"],
    grok: ["XAI_API_KEY"],
    openai: ["OPENAI_API_KEY"]
  };
  return Object.entries(envByProvider)
    .filter(([, names]) => names.some(name => Boolean(process.env[name]?.trim())))
    .map(([id]) => id);
}

function isUnavailableProviderText(text: string, confidence: number) {
  return confidence <= 0 || /not configured|not available|not reachable|blocked|placeholder/i.test(text);
}

async function isOllamaReachable() {
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(1200) });
    return response.ok;
  } catch {
    return false;
  }
}

async function answerGeneral(input: string): Promise<CouncilResponse> {
  const providerIds = configuredProviderIds();
  if (await isOllamaReachable()) providerIds.push("ollama");

  const prompt = [
    "You are AI Council in direct assistant mode.",
    "Answer the user's general question naturally and concisely, like a capable everyday AI assistant.",
    "Prefer short paragraphs or a few bullets. Do not produce a Council report.",
    "Do not mention repo context, agents, councils, governance, runtime, traces, or implementation plans unless the user asks about them.",
    "If the question may depend on current facts and you do not have live browsing, say that briefly before answering from general knowledge.",
    "Do not invent product ownership, release details, prices, or current capabilities.",
    "",
    `User question: ${input}`
  ].join("\n");

  const attempts: string[] = [];
  for (const providerId of [...new Set(providerIds)]) {
    const provider = providerRegistry.get(providerId);
    if (!provider) continue;
    const response = await provider.call({
      prompt,
      privacyLevel: provider.tier === "local" ? "local-only" : "sanitized-external",
      riskLevel: "low",
      taskType: "general",
      allowNetwork: provider.tier !== "local"
    });
    attempts.push(`${response.provider}:${response.model}`);
    if (!isUnavailableProviderText(response.text, response.confidence)) {
      return {
        selectedCouncil: "direct-answer",
        selectedProvider: response.provider,
        agentsUsed: [],
        warnings: [
          ...(response.warnings || []),
          "Direct assistant mode used; no project context or Council agents were attached."
        ],
        answer: response.text.trim(),
        events: [
          directEvent("Direct answer", `Answered with ${response.provider}.`),
          directEvent("Final answer", "Returned a general assistant response without Council routing.")
        ]
      };
    }
  }

  return {
    selectedCouncil: "direct-answer",
    selectedProvider: attempts[0] || "none",
    agentsUsed: [],
    warnings: ["No configured or reachable general model provider was available."],
    answer: [
      "I understood this as a general question, so I did not route it through the project Council.",
      "A direct model provider is not available in the current API process yet. Configure Ollama or one cloud provider key, then I can answer normal questions directly."
    ].join("\n"),
    events: [
      directEvent("Direct answer", "General question detected; no project context was attached.", "blocked"),
      directEvent("Final answer", "Returned a short provider setup note.")
    ]
  };
}

async function answerWeather(input: string): Promise<CouncilResponse | null> {
  const location = weatherLocationFrom(input);
  if (!location) return null;

  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", location);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error(`geocoding failed: ${geoResponse.status}`);
    const geo = await geoResponse.json() as { results?: Array<{ name: string; country?: string; latitude: number; longitude: number; timezone?: string }> };
    const place = geo.results?.[0];
    if (!place) {
      return {
        selectedCouncil: "direct-answer",
        selectedProvider: "open-meteo",
        agentsUsed: [],
        warnings: [],
        answer: `I could not find a weather location for "${location}". Try a city plus country, for example "weather in Basel, Switzerland."`,
        events: [directEvent("Weather lookup", `No matching location found for ${location}.`), directEvent("Final answer", "Returned a short direct answer.")]
      };
    }

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(place.latitude));
    forecastUrl.searchParams.set("longitude", String(place.longitude));
    forecastUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m");
    forecastUrl.searchParams.set("timezone", place.timezone || "auto");
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) throw new Error(`forecast failed: ${forecastResponse.status}`);
    const forecast = await forecastResponse.json() as {
      current?: {
        time?: string;
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        precipitation?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
      current_units?: Record<string, string>;
    };
    const current = forecast.current;
    if (!current) throw new Error("forecast missing current weather");

    const units = forecast.current_units || {};
    const placeName = [place.name, place.country].filter(Boolean).join(", ");
    const summary = weatherCodeLabel(Number(current.weather_code ?? -1));
    const answer = [
      `${place.name} weather right now: ${summary}, ${current.temperature_2m}${units.temperature_2m || "°C"} feels like ${current.apparent_temperature}${units.apparent_temperature || "°C"}.`,
      `Humidity is ${current.relative_humidity_2m}${units.relative_humidity_2m || "%"}, wind is ${current.wind_speed_10m}${units.wind_speed_10m || " km/h"}, and precipitation is ${current.precipitation}${units.precipitation || " mm"}.`,
      "",
      `Location used: ${placeName}. Updated: ${current.time || "current Open-Meteo reading"}.`
    ].join("\n");

    return {
      selectedCouncil: "direct-answer",
      selectedProvider: "open-meteo",
      agentsUsed: [],
      warnings: ["Public weather lookup used; no project context was sent."],
      answer,
      events: [
        directEvent("Weather lookup", `Checked current public weather for ${placeName}.`),
        directEvent("Final answer", "Returned a short direct answer without Council routing.")
      ]
    };
  } catch (error: any) {
    return {
      selectedCouncil: "direct-answer",
      selectedProvider: "open-meteo",
      agentsUsed: [],
      warnings: [`Weather lookup failed: ${error?.message || String(error)}`],
      answer: `I understood this as a weather question for ${location}, but the live weather lookup failed. I did not route it through the repo-review Council.`,
      events: [directEvent("Weather lookup", `Tried to check weather for ${location}.`, "blocked"), directEvent("Final answer", "Returned a short fallback answer.")]
    };
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") { json(res, 204, {}); return; }
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/health") { json(res, 200, { ok: true, service: "ai-council-api", phase: 16 }); return; }
    if (url.pathname === "/api/summary") {
      const currentCounts = counts();
      const notes = [];
      if (!exists("packages/skills")) notes.push("Skills package missing.");
      if (!exists("storage/observability")) notes.push("Observability storage missing.");
      json(res, 200, { ok: notes.length === 0, generatedAt: new Date().toISOString(), counts: currentCounts, health: { status: notes.length ? "degraded" : "ready", notes } });
      return;
    }
    if (url.pathname.startsWith("/api/catalog/")) {
      const key = url.pathname.split("/").pop() || "";
      const collections = allCollections() as Record<string, any[]>;
      if (!collections[key]) { json(res, 404, { error: `Unknown collection: ${key}` }); return; }
      json(res, 200, { collection: key, count: collections[key].length, items: collections[key] });
      return;
    }
    if (url.pathname === "/api/projects") {
      const currentProjects = projects();
      json(res, 200, { count: currentProjects.length, projects: currentProjects });
      return;
    }
    if (url.pathname === "/api/observability") {
      const records = {
        runs: latestRecords("storage/observability/runs", 1000).length,
        traces: latestRecords("storage/observability/traces", 1000).length,
        providerCalls: latestRecords("storage/observability/provider-calls", 1000).length,
        costs: latestRecords("storage/observability/costs", 1000).length,
        artifacts: latestRecords("storage/observability/artifacts", 1000).length,
        diagnostics: latestRecords("storage/observability/diagnostics", 1000).length
      };
      json(res, 200, {
        generatedAt: new Date().toISOString(),
        records,
        latest: {
          runs: latestRecords("storage/observability/runs"),
          providerCalls: latestRecords("storage/observability/provider-calls"),
          artifacts: latestRecords("storage/observability/artifacts"),
          diagnostics: latestRecords("storage/observability/diagnostics")
        }
      });
      return;
    }
    if (url.pathname === "/api/runtime/latest") {
      json(res, 200, runtimeSnapshot());
      return;
    }
    if (url.pathname === "/api/runtime/context" && req.method === "POST") {
      const body = await readBody(req);
      const project = String(body.project || "TradeFrame");
      const task = String(body.task || "Review project context.");
      const result = runScript("runtime-context.mjs", [project, task]);
      json(res, result.ok ? 200 : 500, { ...result, runtime: runtimeSnapshot() });
      return;
    }
    if (url.pathname === "/api/runtime/run" && req.method === "POST") {
      const body = await readBody(req);
      const project = String(body.project || "TradeFrame");
      const task = String(body.task || "Run a grounded Council review.");
      const result = runScript("runtime-run.mjs", [project, task]);
      json(res, result.ok ? 200 : 500, { ...result, runtime: runtimeSnapshot() });
      return;
    }
    if (url.pathname === "/api/runtime/eval" && req.method === "POST") {
      const body = await readBody(req);
      const artifact = body.artifact ? [String(body.artifact)] : [];
      const result = runScript("runtime-eval.mjs", artifact);
      json(res, result.ok ? 200 : 500, { ...result, runtime: runtimeSnapshot() });
      return;
    }
    if (url.pathname === "/api/providers/health") {
      const result = runScript("provider-health.mjs");
      json(res, result.ok ? 200 : 500, result);
      return;
    }
    if (url.pathname === "/api/route" && req.method === "POST") {
      const body = await readBody(req);
      const input = String(body.input || "");
      json(res, 200, {
        request: input,
        generatedAt: new Date().toISOString(),
        route: route(input),
        recommendedNextStep: "Create a Codex context pack, confirm the target project, then run the matching workflow."
      });
      return;
    }
    if (url.pathname.startsWith("/api/project/")) {
      const name = decodeURIComponent(url.pathname.replace("/api/project/", ""));
      const rel = exists(`projects/${name}`) ? `projects/${name}` : exists(`storage/memory/projects/${name}`) ? `storage/memory/projects/${name}` : null;
      const candidates = [
        `projects/${name}/PROJECT.md`,
        `projects/${name}/README.md`,
        `storage/memory/projects/${name}/project-context.md`
      ];
      const preview = candidates.map(candidate => ({ candidate, text: exists(candidate) ? readText(candidate) : null })).find(item => item.text)?.text || "";
      json(res, 200, {
        name,
        rel,
        hasMemory: exists(`storage/memory/projects/${name}/project-context.md`),
        hasProjectFile: exists(`projects/${name}/PROJECT.md`) || exists(`projects/${name}/README.md`),
        preview: preview.slice(0, 4000)
      });
      return;
    }
    if (url.pathname === "/api/response-events" && req.method === "POST") {
      const body = await readBody(req);
      const projectId = body.projectId ? String(body.projectId) : undefined;
      const input = String(body.input ?? "No input provided");
      const directWeather = weatherLocationFrom(input);
      if (directWeather) {
        json(res, 200, { events: [directEvent("Weather lookup", `Preparing current weather for ${directWeather}.`, "active"), directEvent("Final answer", "A short direct answer will be returned.", "pending")] });
        return;
      }
      if (!body.agentId && isDirectGeneralRequest(input)) {
        json(res, 200, { events: [directEvent("Direct answer", "Preparing a general assistant response without project context.", "active"), directEvent("Final answer", "A short direct answer will be returned.", "pending")] });
        return;
      }
      const context = shouldAttachProjectContext(input, projectId) ? [
        projectContextFor(projectId),
        buildRepoReviewContext(root, projectId, input)
      ].filter(Boolean).join("\n\n---\n\n") : "";
      const request = {
        input: context ? `${input}\n\nRelevant project context:\n${context}` : input,
        projectId,
        taskType: body.taskType,
        privacyLevel: body.privacyLevel ?? "local-only",
        riskLevel: body.riskLevel ?? "medium"
      };
      json(res, 200, { events: orchestrator.planResponseEvents(request, body.agentId ? String(body.agentId) : undefined) });
      return;
    }
    if (url.pathname === "/ask" && req.method === "POST") {
      const body = await readBody(req);
      const projectId = body.projectId ? String(body.projectId) : undefined;
      const input = String(body.input ?? "No input provided");
      const directWeather = await answerWeather(input);
      if (directWeather) {
        json(res, 200, directWeather);
        return;
      }
      if (!body.agentId && isDirectGeneralRequest(input)) {
        json(res, 200, await answerGeneral(input));
        return;
      }
      const context = shouldAttachProjectContext(input, projectId) ? [
        projectContextFor(projectId),
        buildRepoReviewContext(root, projectId, input)
      ].filter(Boolean).join("\n\n---\n\n") : "";
      const request = {
        input: context ? `${input}\n\nRelevant project context:\n${context}` : input,
        projectId,
        taskType: body.taskType,
        privacyLevel: body.privacyLevel ?? "local-only",
        riskLevel: body.riskLevel ?? "medium"
      };
      const response = body.agentId
        ? await orchestrator.runSingleAgent(request, String(body.agentId))
        : await orchestrator.run(request);
      json(res, 200, response);
      return;
    }
    json(res, 404, { error: "Not found" });
  } catch (error: any) {
    json(res, 500, { error: error?.message || String(error) });
  }
});

server.listen(port, () => console.log(`AI Council API running on http://localhost:${port}`));
