# AI Council Agent Operating Guide

This repository is the working brain for AI Council. Coding agents such as Codex, Claude Code, Gemini CLI, or ChatGPT should treat this file as the first instruction layer.

## Start Protocol

1. Read `packages/orchestrator/bootstrap.md`.
2. Read the active project `PROJECT.md`, `projects/<project>/PROJECT.md`, or `projects/<project>/README.md`.
3. Identify the required senior agents.
4. Load only the required skills and decision engines.
5. Produce a short implementation plan before changing code.
6. Reuse existing packages before creating new ones.
7. Update documentation when behavior, architecture, or workflows change.
8. Run validation before delivery.

For substantial project work, use the runtime loop before implementation:

1. `pnpm runtime:index`
2. `pnpm runtime:context <project> "<task>"`
3. Review `storage/runtime/cache/latest-runtime-context.json`.
4. When a runtime artifact is useful, run `pnpm runtime:run <project> "<task>"`.
5. Score the artifact with `pnpm runtime:eval`.

## Non-Negotiable Rules

- Do not duplicate existing concepts under new names.
- Do not create placeholder code that pretends to work.
- Do not hardcode secrets.
- Do not invent APIs without checking existing code first.
- For trading, finance, legal, medical, and security topics, include safety boundaries and risk notes.
- Prefer small, testable changes over broad rewrites.

## Repository Role Model

- `packages/orchestrator`: routes work and defines council behavior.
- `packages/skills`: reusable expert knowledge modules.
- `packages/senior-agents`: role/persona operating files.
- `packages/decision-engines`: repeatable reasoning systems.
- `projects`: product-specific implementation contexts.
- `packages/workflows`: reusable execution processes.
- `docs`: architecture, standards, and operating documentation.


## Decision engine rule

For any task involving architecture, product direction, financial/trading risk, security, privacy, brand strategy, release readiness, or expensive tradeoffs, select a decision engine from `packages/decision-engines` before implementation.

Use the engine to produce a decision memo, then hand off to the relevant senior agent and skills.


## Workflow routing

For substantial tasks, do not jump directly from request to implementation. Route the task through `packages/workflows/` first. The workflow determines which senior agents, skills, and decision engines should be loaded.

Preferred sequence:

1. `pnpm workflows:route "<task>"`
2. Read the selected workflow.
3. Load referenced agents, skills, and engines.
4. Execute phases.
5. Validate with `pnpm validate:knowledge` when changing Council structure.
6. Validate with `pnpm final:validate` when changing runtime, CLI, evals, governance, provider routing, or release gates.


## Phase 6: Deliverable Template Rule

When a task asks for a concrete output, select a matching template from `packages/templates/deliverables/` before writing. If no exact match exists, route through `pnpm templates:route "<request>"` and use the closest template while stating assumptions.


## Phase 7 Runtime Memory Rules

Before making meaningful project changes, inspect the active project context and recent decision history when available.

Required runtime order:

1. Read the current user request.
2. Inspect repository files directly.
3. Load project context from `storage/memory/projects/<project>/project-context.md` when present.
4. Load relevant decision records from `storage/memory/decisions/`.
5. Generate or update a context pack using `pnpm memory:context <project> "<task>"` when working in Codex.
6. After meaningful work, create a session summary and decision records for durable decisions.

Do not let stale memory override current code, tests, or explicit user instructions.


## Phase 8 Developer Experience Rules

When using the repo with Codex or another coding agent:

1. Run `pnpm council doctor` before major structural work.
2. Use `pnpm council route "<task>"` to inspect likely agents, engines, workflows, skills, and templates.
3. Use `pnpm runtime:context <project> "<task>"` or `pnpm council context <project> "<task>"` before long coding sessions.
4. Save durable decisions with the memory runtime.
5. Regenerate `docs/repo-map.md` after major folder changes.
6. Do not bypass validation after editing knowledge, agent, workflow, template, memory, or CLI files.
7. Run `pnpm runtime:eval` after producing runtime execution artifacts.


## Provider and tool rules

- Use `packages/ai-providers/` before choosing a model provider.
- Use local providers for private repository context unless the user approves cloud use.
- Use premium providers for high-risk architecture, security, finance, trading, legal, or medical reasoning.
- Use `packages/tool-contracts/` before high-impact or external-state-changing shell, Git, email, calendar, Drive, browser, web search, database, or artifact tool actions. Routine read-only repository inspection is allowed.
- Never expose secrets, silently delete data, send communications, or perform financial execution.


## Project Packs

Before working on TradeFrame, SignalScout, NAVO, or Swimly, load the matching file under `packages/project-packs/`. The project pack is the source of truth for wedge, MVP, risks, active tasks, decisions, and Codex context.

## Governance requirement

Before executing any high-impact task, the Council must check `packages/governance`. Actions involving deletion, external messages, publishing, deployment, secrets, private data, paid providers, or trading/finance execution require a permission check and may require explicit human approval.



---

# v2.0.0 Final Operating Rule

AI Council is now foundation-complete. New work should usually target product execution, quality improvement, eval expansion, or project-specific implementation rather than broad structural expansion.

Before any substantial task, run this mental preflight:

1. Which project is affected?
2. Which context pack should be loaded?
3. Which senior agents are relevant?
4. Which skills and decision engines are required?
5. Which workflow applies?
6. Is governance approval needed?
7. What tests, evals, or gates verify completion?
8. What memory, docs, traces, or decisions should be updated?

For substantial work, include a short preflight in the response or working notes:

```txt
Project:
Workflow:
Decision engine:
Lead agent:
Supporting agents/skills:
Governance:
Validation:
Memory/docs/traces:
```
