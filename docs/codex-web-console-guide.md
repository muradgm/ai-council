# Codex Web Console Guide

Use this guide when a Codex session needs to inspect or extend the Web Console.

## Startup prompt

```text
Read:
- AGENTS.md
- packages/orchestrator/bootstrap.md
- docs/web-console-system.md
- apps/web-console/README.md
- apps/api-server/src/main.ts

Task:
Extend the Web Console without adding heavy dependencies unless explicitly approved.
Maintain local-first, read-first behavior.
```

## Local run

```bash
pnpm install
pnpm dev:api
pnpm dev:web
```

## Development rules

1. Keep browser code simple and auditable.
2. Do not place secrets in frontend code.
3. Do not call cloud providers from the browser.
4. Add API endpoints before adding UI panels that need repository data.
5. Keep write actions disabled until governance rules are implemented.
6. Update `docs/web-console-system.md` when adding panels.
7. Run `pnpm validate:knowledge` before packaging.

## Useful commands

```bash
pnpm console:status
pnpm console:snapshot
pnpm council route "build an AI trading journal feature"
```
