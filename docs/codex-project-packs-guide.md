# Codex Project Packs Guide

Use this guide when starting Codex on a real AI Council product.

## Recommended startup

```bash
pnpm project-pack:context <project> "<task>"
```

Then paste the generated context into Codex.

## Manual reading order

1. `AGENTS.md`
2. `packages/orchestrator/bootstrap.md`
3. `packages/project-packs/<project>/PROJECT_PACK.md`
4. `packages/project-packs/<project>/codex/CODEX_CONTEXT.md`
5. `packages/project-packs/<project>/tasks/ACTIVE_TASKS.md`
6. `packages/project-packs/<project>/decisions/DECISION_LOG.md`
7. `storage/memory/projects/<Project>/project-context.md`

## Rule

Do not let Codex start coding from a vague prompt. First force it to load the project pack and route the task through the Council.
