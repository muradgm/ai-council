# Developer Experience System

Phase 8 adds the developer-experience layer. The goal is to make AI Council practical to use from Codex, local terminals, and future web tooling.

## What This Phase Adds

- A unified `pnpm council` command.
- Repository diagnostics.
- Health summaries.
- Task routing across agents, engines, workflows, skills, and templates.
- Codex bootstrap prompt generation.
- Codex context-pack generation.
- Project initialization.
- Project readiness checks.
- Repository map generation.
- VS Code tasks and recommended extensions.
- GitHub Actions validation.

## Recommended Daily Flow

```bash
pnpm install
pnpm council doctor
pnpm council route "describe your task"
pnpm council context TradeFrame "describe your task"
```

Then open the generated context pack in `storage/context-packs/` and use it as the startup context for Codex.

## Why This Matters

Without a DX layer, the repo becomes a library of good files that are hard to apply consistently. The CLI gives the Council a stable operating surface.
