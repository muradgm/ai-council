# AI Council CLI

The CLI is the developer-experience front door for AI Council. It does not replace the orchestrator; it gives Codex and human developers a predictable way to inspect, route, validate, and bootstrap work.

## Core Principles

1. **One command should reveal the next useful action.**
2. **All routing must be inspectable.** The CLI saves generated route/context files under `storage/context-packs/`.
3. **Diagnostics must fail loudly.** Structural problems should surface before a coding agent starts editing.
4. **Project context is runtime state.** The CLI should load project memory before asking agents or workflows to act.
5. **No hidden magic.** Every generated prompt should cite the files it expects the agent to read.

## Main Commands

```bash
pnpm council help
pnpm council status
pnpm council doctor
pnpm council route "build an AI trading journal"
pnpm council bootstrap TradeFrame "build the trading journal MVP"
pnpm council context TradeFrame "build the trading journal MVP"
pnpm council project:init MyProject "short description"
```

## Relationship to Codex

Use the CLI to generate a Codex-ready context pack before a large coding session. Paste the generated context into Codex, or tell Codex to read the generated file.
