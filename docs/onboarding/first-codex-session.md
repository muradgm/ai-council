# First Codex Session

Use this process for the first practical session after unzipping the repo.

## Startup prompt

```text
Read AGENTS.md, packages/orchestrator/bootstrap.md, and docs/codex-master-startup.md.
Then initialize AI Council for this repository.
Run pnpm validate:knowledge and pnpm final:validate.
After that, help me choose the first project execution task.
```

## First useful project tasks

Good first tasks are narrow, testable, and project-specific:

- TradeFrame: build the trading journal MVP data model.
- SignalScout: implement the first audit workflow.
- NAVO/Flowday: implement route-aware day planning.
- Swimly: improve pool recommendation scoring.

Bad first tasks are vague platform expansion tasks:

- “make the AI Council smarter”
- “add 200 more agents”
- “automate everything”

Those create size without value.

## Working rule

Ask Codex to produce a plan first for architecture-level changes. For local documentation, generated drafts, and small scaffolds, it can execute directly after routing and governance checks.
