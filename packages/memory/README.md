# `@ai-council/memory`

The memory package defines the durable runtime context system for AI Council.

It is intentionally file-based in this phase. That makes it easy to review in Git, easy to edit by hand, and safe to use before adding a database-backed runtime.

## What it contains

- Memory schemas
- Context-pack templates
- Project/session/decision/task memory templates
- Loader policies
- Codex runtime guidance
- Example project contexts

## What it is not

It is not autonomous long-term memory. It does not silently rewrite the repo. It provides structured files that humans and coding agents can inspect, update, and validate.

## Main commands

```bash
pnpm memory:init
pnpm memory:status
pnpm project:context TradeFrame
pnpm memory:context TradeFrame "build trading journal MVP"
pnpm memory:decision TradeFrame "Use PostgreSQL" "Reason: transactional reporting and auditability."
pnpm memory:session TradeFrame "Implemented first journal schema and updated docs."
```
