# Project Packs System

Phase 13 adds project-specific packs that connect AI Council's generic knowledge to real products.

## What a project pack contains

Each project pack includes:

- `PROJECT_PACK.md` — product purpose, wedge, users, MVP, routing
- `project-pack.json` — machine-readable manifest
- `strategy/` — product strategy, wedge, positioning
- `architecture/` — architecture direction, data model, integrations
- `roadmap/` — roadmap and milestones
- `tasks/` — active tasks and backlog
- `risks/` — risk register
- `decisions/` — decision log
- `codex/` — Codex context and startup prompt
- `workflows/` — project-specific build/review workflows
- `evals/` — acceptance criteria
- `memory/` — memory seed

## Why this matters

Without project packs, agents may give good generic advice but miss the actual product direction. Project packs prevent that by making product context loadable and explicit.

## Standard command

```bash
pnpm project-pack:context tradeframe "build the trading journal MVP"
```

This prints a context pack that Codex can use before planning implementation.
