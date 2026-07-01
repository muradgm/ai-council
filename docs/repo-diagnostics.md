# Repository Diagnostics

AI Council uses diagnostics to prevent structure drift.

## Main Checks

```bash
pnpm validate:knowledge
pnpm council doctor
pnpm council health
```

## What Diagnostics Validate

- Required repository entry points exist.
- Skills have `SKILL.md` and `skill.json`.
- Agents have `AGENT.md` and `agent.json`.
- Decision engines have `ENGINE.md` and `engine.json`.
- Workflows have `WORKFLOW.md` and `workflow.json`.
- Templates have `TEMPLATE.md` and `template.json`.
- Memory runtime exists.
- CLI layer exists.
- Package scripts are wired.

## When to Run

Run diagnostics after every structural change and before asking Codex to continue from a newly modified repo.
