# Codex Runtime Guide

Use this guide when opening AI Council in Codex, Claude Code, Gemini CLI, or another coding agent.

## First command sequence

```bash
pnpm install
pnpm validate:knowledge
pnpm memory:init
pnpm memory:status
```

## Start a project session

```bash
pnpm runtime:index
pnpm runtime:context TradeFrame "build the trading journal MVP"
pnpm runtime:run TradeFrame "review the trading journal MVP architecture"
pnpm runtime:eval
pnpm project:context TradeFrame
pnpm memory:context TradeFrame "build the trading journal MVP"
```

The runtime context command creates a cached runtime pack under:

```text
storage/runtime/cache/
```

The memory context command creates a context pack under:

```text
storage/context-packs/TradeFrame/
```

Open the generated context pack and use it as the top-level working brief.

## Recommended agent prompt

```text
You are AI Council Orchestrator working inside this repository.

Read:
- AGENTS.md
- packages/orchestrator/bootstrap.md
- storage/context-packs/<project>/latest.context-pack.md

Then:
1. Identify the active project.
2. Select senior agents.
3. Select skills.
4. Select decision engines.
5. Select workflow.
6. Create a plan.
7. Execute only after checking existing files.
8. Update docs, tests, and memory records.
```

## After a work session

Create a session summary:

```bash
pnpm memory:session <project> "short summary of what changed"
```

Record durable decisions:

```bash
pnpm memory:decision <project> "Use PostgreSQL for audit-safe trading journal storage" "Reason: relational data, reporting, transactional integrity."
```

Capture response-quality feedback:

```bash
pnpm learning:feedback TradeFrame 3 "The answer was useful but too generic and did not cite project files."
pnpm learning:report
```

Learning records propose eval, prompt, documentation, and runtime improvements. They do not silently change production behavior.

## Runtime execution loop

`pnpm runtime:run <project> "<task>"` performs the first end-to-end runtime loop:

1. Ensures the runtime index exists.
2. Generates project/task runtime context.
3. Loads the selected project, workflow, engine, agents, and skills.
4. Attempts local Ollama execution through `OLLAMA_BASE_URL` and `OLLAMA_MODEL`.
5. Falls back to deterministic repo-grounded synthesis if Ollama is unavailable.
6. Writes runtime artifacts, provider traces, run traces, and session memory.

`pnpm runtime:eval` scores the latest runtime artifact for required sections, file citations, provider transparency, validation commands, risks, and next actions. It writes:

```text
storage/evals/latest-runtime-artifact-report.md
storage/evals/latest-runtime-artifact-report.json
```

## Rule

Memory must reduce repeated work. It must not hide uncertainty. When memory conflicts with code, inspect code and update memory.
