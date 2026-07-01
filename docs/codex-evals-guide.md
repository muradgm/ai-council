# Codex Evals Guide

Use this guide when working inside the AI Council repo with Codex or another coding agent.

## Before changing major code

```bash
pnpm council status
pnpm council route "<task>"
pnpm evals:route "<task>"
pnpm gates:run
```

## After changing knowledge, agents, workflows, or templates

```bash
pnpm validate:knowledge
pnpm evals:run
pnpm gates:run
```

## When an eval fails

Do not patch randomly. Inspect the failing suite and answer these questions:

1. Is the request ambiguous?
2. Is the expected route wrong?
3. Is the manifest missing keywords?
4. Is the skill/agent/engine missing domain terms?
5. Is the router too simple for this case?
6. Is the quality gate too strict or too weak?

Then fix the smallest responsible layer.

## Recommended Codex prompt

```text
Read packages/evals/EVALS.md and docs/codex-evals-guide.md.
Run pnpm evals:run and pnpm gates:run.
Fix only the failing suite, manifest, or router logic needed to pass without weakening the quality bar.
Update the report and summarize the change.
```
