# Phase 08 — CLI + Developer Experience Layer

## Purpose

Phase 8 turns the Council into something usable from a terminal and from Codex. The repo already had skills, agents, decision engines, workflows, templates, and memory. This phase adds the operating surface that ties them together.

## Added Capabilities

- Unified `pnpm council` command.
- Repo health checks.
- Repo diagnostics.
- Natural-language routing.
- Codex bootstrap prompt generation.
- Codex context-pack generation.
- Project scaffolding.
- Project readiness diagnostics.
- Repository map generation.
- VS Code tasks.
- GitHub validation workflow.

## Validation

```bash
pnpm validate:knowledge
pnpm council doctor
pnpm council route "build an AI trading journal"
pnpm council context TradeFrame "build MVP"
```

## Next Phase Recommendation

Phase 9 should add **Evals + Quality Gates**: regression test datasets, golden examples, rubric runners, output scoring, agent behavior checks, and workflow acceptance tests.
