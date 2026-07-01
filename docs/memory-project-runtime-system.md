# Memory + Project Runtime System

Phase 7 adds the runtime layer that lets AI Council carry useful project context across Codex sessions without turning the repository into a vague prompt dump.

## Purpose

The runtime layer answers five questions before work begins:

1. Which project is active?
2. What is the latest known context?
3. What decisions have already been made?
4. What task is currently being executed?
5. Which context pack should be loaded into Codex?

## Core concepts

| Concept | Location | Purpose |
|---|---|---|
| Project context | `storage/memory/projects/<project>/project-context.md` | Durable product, architecture, domain, and constraints context. |
| Session summary | `storage/memory/sessions/` | What happened in one work session. |
| Decision record | `storage/memory/decisions/` | Architecture, product, design, and business decisions. |
| Task state | `storage/memory/tasks/` | Current work item, acceptance criteria, blockers, and status. |
| Context pack | `storage/context-packs/` | A compact prompt-ready package for Codex or another coding agent. |
| Runtime index | `storage/runtime/repo-index.json` | Structured map of agents, skills, engines, workflows, projects, providers, tools, and relationships. |
| Runtime cache | `storage/runtime/cache/` | Cached task-specific runtime context for a project session. |
| Learning feedback | `storage/learning/feedback/` | Response-quality feedback used to propose eval, prompt, docs, and runtime improvements. |
| Memory templates | `packages/memory/templates/` | Reusable document formats for structured memory. |
| Loader policy | `packages/memory/loaders/` | Rules for what to load, in what order, and when to ignore stale context. |

## Important boundary

Memory is not truth by itself. It is a working context layer. Source code, committed docs, tests, and explicit user instructions override memory when they conflict.

## Recommended Codex startup

```text
Read AGENTS.md.
Then read packages/orchestrator/bootstrap.md.
Then run or inspect:
- pnpm runtime:index
- pnpm runtime:context <project-name> "<task>"
- pnpm memory:status
- pnpm project:context <project-name>
- pnpm memory:context <project-name> "<task>"

Load the resulting context pack before making changes.
```

## Context priority

1. Current user request
2. Repository code and committed project docs
3. Active project context file
4. Decision records
5. Recent session summaries
6. Skill/agent/engine/workflow/template files
7. Older memory and examples

## How this helps

Without this layer, every Codex session starts cold and may re-decide things already settled. With this layer, the Council can preserve decision history, active constraints, project goals, and working task state while keeping memory auditable and editable.

## Learning loop

AI Council should learn from response quality, language, usefulness, safety, and grounding feedback. The learning loop is deliberately review-first:

1. Capture feedback with `pnpm learning:feedback <project> <1-5> "<feedback>"`.
2. Aggregate patterns with `pnpm learning:report`.
3. Convert repeated issues into proposed eval cases, prompt changes, docs updates, or runtime fixes.
4. Apply behavior-changing improvements only after human review, passing evals, and `pnpm final:validate`.

## Runtime execution

Use `pnpm runtime:run <project> "<task>"` for the first executable Council loop. It builds the runtime context, loads selected Council assets, attempts local Ollama execution, writes a grounded artifact, records observability traces, and stores a session summary. If Ollama is unavailable, the run remains useful by producing deterministic repo-grounded synthesis and a clear provider warning.

Use `pnpm runtime:eval` after a runtime run to score the generated artifact for grounding, citations, provider transparency, validation commands, risks, and actionability. This keeps the runtime loop honest: reports must be useful, not merely generated.
