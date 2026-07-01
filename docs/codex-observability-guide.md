# Codex Observability Guide

When using Codex with AI Council, record evidence for meaningful work.

## Before work

Run:

```bash
pnpm council status
pnpm observability:status
```

## During work

For high-risk tasks, record:

- selected agents
- selected workflows
- provider/tool usage
- artifacts produced
- validation commands

## After work

Run:

```bash
pnpm validate:knowledge
pnpm diagnostics:report
pnpm trace:run "Project" "Task" "Summary of completed work"
```

## Do not log

- API keys
- passwords
- secrets
- private personal content
- raw provider prompts unless explicitly requested and safe
