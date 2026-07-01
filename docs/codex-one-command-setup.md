# Codex One-Command Setup

Use this when starting a Codex session.

## General startup

```bash
pnpm install
pnpm council doctor
pnpm council bootstrap general "initialize this repository"
```

## Project-specific startup

```bash
pnpm council context TradeFrame "build the trading journal MVP"
```

Then tell Codex:

```text
Read the generated file in storage/context-packs/ and follow its execution contract.
```

## Best Prompt for Codex

```text
You are working inside AI Council. Read AGENTS.md, packages/orchestrator/bootstrap.md, and the generated context pack. Follow the routed agents, decision engines, workflows, and skills. Before changing code, search the repo for existing patterns. After changes, run validation and update memory/docs.
```

## Required Checks Before Commit

```bash
pnpm validate:knowledge
pnpm council doctor
pnpm test
```
