export type ActionKind =
  | "create_file"
  | "update_file"
  | "create_folder"
  | "delete_file"
  | "run_command"
  | "install_package"
  | "use_external_provider"
  | "publish";

export type ActionRiskLevel = "low" | "medium" | "high" | "critical";

export type ActionDecisionStatus = "allow" | "allow_with_logging" | "approval_required" | "blocked";

export type ActionIntent = {
  id: string;
  kind: ActionKind;
  description: string;
  projectId?: string;
  target?: string;
  command?: string;
  args?: string[];
  contentPreview?: string;
  reason?: string;
};

export type ActionPlan = {
  id: string;
  projectId: string;
  request: string;
  dryRun: boolean;
  actions: ActionIntent[];
};

function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "action";
}

function id(prefix: string, index: number) {
  return `${prefix}-${String(index + 1).padStart(2, "0")}`;
}

export function createActionPlan(projectId: string, request: string, dryRun = true): ActionPlan {
  const lower = request.toLowerCase();
  const actions: ActionIntent[] = [];

  if (/delete|remove|wipe|reset/.test(lower)) {
    actions.push({
      id: id("act", actions.length),
      kind: "delete_file",
      description: "Potential destructive file operation requested.",
      projectId,
      target: "unspecified",
      reason: "Deletion requires explicit scoped approval and rollback planning."
    });
  }

  if (/install|add package|npm install|pnpm add|yarn add/.test(lower)) {
    actions.push({
      id: id("act", actions.length),
      kind: "install_package",
      description: "Install or modify project dependencies.",
      projectId,
      command: lower.includes("pnpm") ? "pnpm add" : "package-manager install",
      reason: "Dependency changes affect supply-chain and lockfile state."
    });
  }

  if (/deploy|publish|push|release/.test(lower)) {
    actions.push({
      id: id("act", actions.length),
      kind: "publish",
      description: "Publish, deploy, push, or release externally.",
      projectId,
      command: "git push / deploy",
      reason: "External state changes need an approval/audit boundary."
    });
  }

  if (/\.env|api key|secret|token|password|private key/.test(lower)) {
    actions.push({
      id: id("act", actions.length),
      kind: "update_file",
      description: "Potential secret-bearing change requested.",
      projectId,
      target: ".env or secret-bearing file",
      reason: "Secret-bearing actions are blocked by default."
    });
  }

  if (/source|code|runtime|agent|orchestrator|api|console|test|script/.test(lower)) {
    actions.push({
      id: id("act", actions.length),
      kind: "update_file",
      description: "Plan source-code changes for the requested implementation.",
      projectId,
      target: "packages/ or apps/ source files",
      reason: "Source edits need review before execution."
    });
  }

  actions.push({
    id: id("act", actions.length),
    kind: "create_file",
    description: "Create an implementation plan artifact for review.",
    projectId,
    target: `storage/governance/action-plans/${slug(projectId)}-${slug(request)}.md`,
    contentPreview: `# ${projectId} action plan\n\nRequest: ${request}\n`,
    reason: "A plan artifact is a low-risk way to make the proposed action reviewable."
  });

  actions.push({
    id: id("act", actions.length),
    kind: "run_command",
    description: "Run validation after any approved implementation.",
    projectId,
    command: "pnpm final:validate",
    reason: "Validation is required before delivery."
  });

  return {
    id: `plan-${Date.now()}`,
    projectId,
    request,
    dryRun,
    actions
  };
}
