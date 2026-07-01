# Phase 12 — Apps + Web Console Layer

Phase 12 adds the first visual interface for AI Council v2.

## Added

- `apps/web-console/`
- improved `apps/api-server/`
- console configuration
- console status script
- console snapshot script
- web console documentation
- Codex web console guide
- web console specification
- storage folder for console snapshots

## Why this phase matters

The Council was previously inspectable mainly through CLI commands. The Web Console makes the repository easier to understand, debug, and operate.

This matters because the system now has many moving parts:

- 70 skills
- 51 senior agents
- 37 decision engines
- 33 workflows
- 40 templates
- eval suites
- providers
- tool contracts
- memory
- observability

A visual catalog reduces cognitive load.

## Run

```bash
pnpm install
pnpm dev:api
pnpm dev:web
```

Then open:

```text
http://localhost:5173
```

## Validate

```bash
pnpm validate:knowledge
pnpm console:status
pnpm console:snapshot
```

## Design boundary

Phase 12 is read-first. It does not yet execute workflows from the browser or mutate repository files.
