import type {
  CatalogResponse,
  CollectionName,
  AskResponse,
  ObservabilityResponse,
  ProjectDetailResponse,
  ProjectResponse,
  ProviderHealthResponse,
  ResponseEventsResponse,
  RouteResponse,
  RuntimeActionResponse,
  RuntimeSnapshot,
  Summary
} from "./types.js";

function resolveApiBase(): string {
  const params = new URLSearchParams(window.location.search);
  const queryBase = params.get("apiBase");
  if (queryBase) {
    localStorage.setItem("aiCouncilApiBase", queryBase);
    return queryBase;
  }
  const storedBase = localStorage.getItem("aiCouncilApiBase");
  if (storedBase) return storedBase;
  if (window.location.hostname && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:3333`;
  }
  return "http://localhost:3333";
}

const API_BASE = resolveApiBase();

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  baseUrl: API_BASE,
  summary: () => requestJson<Summary>("/api/summary"),
  catalog: (collection: CollectionName) => requestJson<CatalogResponse>(`/api/catalog/${collection}`),
  route: (input: string) => requestJson<RouteResponse>("/api/route", {
    method: "POST",
    body: JSON.stringify({ input })
  }),
  ask: (input: string, projectId?: string, agentId?: string) => requestJson<AskResponse>("/ask", {
    method: "POST",
    body: JSON.stringify({ input, projectId, agentId, privacyLevel: "local-only", riskLevel: "medium" })
  }),
  responseEvents: (input: string, projectId?: string, agentId?: string) => requestJson<ResponseEventsResponse>("/api/response-events", {
    method: "POST",
    body: JSON.stringify({ input, projectId, agentId, privacyLevel: "local-only", riskLevel: "medium" })
  }),
  runtimeLatest: () => requestJson<RuntimeSnapshot>("/api/runtime/latest"),
  runtimeContext: (project: string, task: string) => requestJson<RuntimeActionResponse>("/api/runtime/context", {
    method: "POST",
    body: JSON.stringify({ project, task })
  }),
  runtimeRun: (project: string, task: string) => requestJson<RuntimeActionResponse>("/api/runtime/run", {
    method: "POST",
    body: JSON.stringify({ project, task })
  }),
  runtimeEval: (artifact?: string | null) => requestJson<RuntimeActionResponse>("/api/runtime/eval", {
    method: "POST",
    body: JSON.stringify({ artifact })
  }),
  providerHealth: () => requestJson<ProviderHealthResponse>("/api/providers/health"),
  observability: () => requestJson<ObservabilityResponse>("/api/observability"),
  projects: () => requestJson<ProjectResponse>("/api/projects"),
  projectDetail: (name: string) => requestJson<ProjectDetailResponse>(`/api/project/${encodeURIComponent(name)}`)
};
