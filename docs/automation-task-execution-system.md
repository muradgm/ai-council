# Automation + Task Execution System

Phase 14 adds the coordination layer that turns Council recommendations into trackable work.

## Added package

```text
packages/automation/
```

## Added runtime storage

```text
storage/automation/
```

## Main commands

```bash
pnpm automation:init
pnpm automation:status
pnpm backlog:add TradeFrame "Build trading journal MVP" "Create journal CRUD, tags, and risk notes"
pnpm backlog:list TradeFrame
pnpm sprint:plan TradeFrame "Trading journal MVP"
pnpm task:queue add TradeFrame "Build journal entry form"
pnpm github:issue TradeFrame "Build journal entry form"
pnpm codex:task TradeFrame "Build journal entry form"
pnpm release:checklist TradeFrame "Journal MVP"
pnpm docs:update TradeFrame "Journal MVP implementation"
pnpm automation:report
```

## Design principle

This layer should make execution safer and more consistent, not more reckless. It creates artifacts and plans. It does not deploy, trade, delete, email, or spend money without explicit approval.
