import type { CatalogItem, CollectionName, Summary } from "./types.js";

export const collections: Array<{ id: CollectionName; label: string; description: string }> = [
  { id: "agents", label: "Senior Agents", description: "Expert personas that own decisions and execution standards." },
  { id: "skills", label: "Skills", description: "Reusable capability folders with SKILL.md, workflows, templates, and checklists." },
  { id: "engines", label: "Decision Engines", description: "Reusable reasoning systems for architecture, product, security, trading, and more." },
  { id: "workflows", label: "Workflows", description: "End-to-end operating procedures for planning, building, reviewing, and shipping." },
  { id: "templates", label: "Deliverables", description: "Reusable output formats such as PRDs, review reports, briefs, and memos." },
  { id: "evalSuites", label: "Evals", description: "Regression and quality tests for routing and output behavior." },
  { id: "providers", label: "Providers", description: "Local, freemium, and premium AI provider definitions and policies." },
  { id: "toolContracts", label: "Tool Contracts", description: "Safe boundaries for file, shell, git, email, browser, and other tool actions." },
  { id: "governance", label: "Governance", description: "Permission checks, approval gates, security policies, trading boundaries, and audit rules." },
  { id: "projects", label: "Projects", description: "Product memory and project runtime records." }
];

export function countFor(summary: Summary | null, id: CollectionName): number {
  if (!summary) return 0;
  const aliases: Record<CollectionName, string> = {
    skills: "skills",
    agents: "agents",
    engines: "engines",
    workflows: "workflows",
    templates: "templates",
    evalSuites: "evalSuites",
    providers: "providers",
    toolContracts: "toolContracts",
    governance: "governance",
    projectPacks: "projectPacks",
    projects: "projects"
  };
  return summary.counts[aliases[id]] || 0;
}

export function displayTitle(item: CatalogItem): string {
  return item.title || item.name || item.id;
}

export function compactText(value: unknown, fallback = "No description available."): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && value.length) return value.join(", ");
  return fallback;
}
