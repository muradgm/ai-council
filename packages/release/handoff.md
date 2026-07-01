# Handoff Guide

## After unzip

```bash
pnpm install
pnpm validate:knowledge
pnpm final:validate
pnpm release:status
```

## First Codex prompt

```text
Read AGENTS.md, packages/orchestrator/bootstrap.md, and docs/codex-master-startup.md.
Initialize AI Council v2.0.0 and help me select the first project execution task.
```

## First recommended task

TradeFrame:

```bash
pnpm council context TradeFrame "build the trading journal MVP"
pnpm council route "build the trading journal MVP"
pnpm codex:task TradeFrame "Build trading journal MVP"
```
