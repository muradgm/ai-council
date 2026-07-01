# Codex Automation Guide

Use this guide when starting Codex on implementation work.

## Recommended flow

1. Generate context:

```bash
pnpm council context TradeFrame "build the trading journal MVP"
```

2. Generate a task prompt:

```bash
pnpm codex:task TradeFrame "build the trading journal MVP"
```

3. Paste the generated prompt into Codex.

4. After implementation, run:

```bash
pnpm validate:knowledge
pnpm gates:run
pnpm docs:update TradeFrame "what changed"
```

5. Record the run:

```bash
pnpm trace:run TradeFrame "build trading journal MVP" "Implemented and verified"
```
