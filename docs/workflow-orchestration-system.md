# Workflow Orchestration System

Phase 5 adds the workflow layer to AI Council.

## Why workflows exist

Skills provide knowledge. Senior agents provide perspective. Decision engines provide structured judgment. Workflows provide **repeatable execution**.

Without workflows, every task depends on the current model remembering the right process. With workflows, the process lives in the repository and can be inspected, improved, and reused.

## Current inventory

- Workflows: **33**
- Senior agents: **47**
- Skills: **70**
- Decision engines: **37**

## Core command flow

```bash
pnpm workflows:list
pnpm workflows:route "review architecture for a trading app"
pnpm workflows:run "architecture-review"
```

## How Codex should use workflows

When starting a task in Codex:

1. Read `AGENTS.md`.
2. Read `packages/orchestrator/bootstrap.md`.
3. Route the request using `pnpm workflows:route "<task>"`.
4. Open the selected workflow's `WORKFLOW.md` and `workflow.json`.
5. Load only the referenced agents, skills, and decision engines.
6. Execute the workflow phases.
7. Validate and document.

## Workflow selection rule

Use the most specific workflow that matches the actual task:

- Code implementation → `build-execution`
- New feature planning → `feature-planning`
- Architecture concern → `architecture-review`
- Trading analysis → `forex-trade-review`, `trading-system-review`, or `risk-review`
- Startup/business idea → `startup-validation` or `business-model-design`
- Brand/design task → `brand-identity`, `naming-system`, or `ui-review`
- Unknown or broad request → `project-kickoff`

## Safety rule

Workflows are not allowed to override safety boundaries. Finance, trading, legal, medical, security, and privacy workflows must produce analytical and educational support unless the user explicitly provides a safe, allowed implementation context.
