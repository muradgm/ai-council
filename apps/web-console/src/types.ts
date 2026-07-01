export type CollectionName =
  | "skills"
  | "agents"
  | "engines"
  | "workflows"
  | "templates"
  | "evalSuites"
  | "providers"
  | "toolContracts"
  | "governance"
  | "projectPacks"
  | "projects";

export type Summary = {
  ok: boolean;
  generatedAt: string;
  counts: Record<string, number>;
  health: {
    status: "ready" | "degraded";
    notes: string[];
  };
};

export type CatalogItem = {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  summary?: string;
  description?: string;
  rel?: string;
  keywords?: string[];
  tags?: string[];
  skills?: string[];
  score?: number;
};

export type CatalogResponse = {
  collection: CollectionName;
  count: number;
  items: CatalogItem[];
};

export type RouteResponse = {
  request: string;
  generatedAt: string;
  route: Record<string, CatalogItem[]>;
  recommendedNextStep: string;
};

export type ObservabilityResponse = {
  generatedAt: string;
  records: Record<string, number>;
  latest: Record<string, unknown[]>;
};

export type ProjectResponse = {
  count: number;
  projects: Array<{
    name: string;
    rel: string;
    hasMemory: boolean;
    hasProjectFile: boolean;
  }>;
};

export type ProjectDetailResponse = {
  name: string;
  rel: string | null;
  hasMemory: boolean;
  hasProjectFile: boolean;
  preview: string;
};

export type RuntimeSnapshot = {
  generatedAt: string;
  latestArtifact: string | null;
  artifactText: string;
  latestEval: {
    score?: number;
    passed?: boolean;
    threshold?: number;
    artifact?: string;
    checks?: Array<{ id: string; label: string; passed: boolean; detail: string }>;
  } | null;
  latestContext: {
    project?: string;
    task?: string;
    recommendedWorkflow?: string;
    recommendedEngine?: string;
    recommendedAgents?: string[];
    recommendedSkills?: string[];
    validation?: string[];
  } | null;
};

export type RuntimeActionResponse = {
  ok: boolean;
  status: number | null;
  command: string;
  stdout: string;
  stderr: string;
  error?: string;
  runtime: RuntimeSnapshot;
};

export type ProviderHealthResponse = {
  ok: boolean;
  status: number | null;
  command: string;
  stdout: string;
  stderr: string;
  error?: string;
};

export type AskResponse = {
  selectedCouncil: string;
  selectedProvider: string;
  agentsUsed: string[];
  warnings: string[];
  answer: string;
};
