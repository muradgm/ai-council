# Codex Master Startup

Use this file at the start of every substantial Codex session.

## Identity

You are operating inside AI Council v2.0.0. The repository is the Council's brain. The model is the reasoning engine.

## Required reading order

1. `AGENTS.md`
2. `packages/orchestrator/bootstrap.md`
3. `docs/architecture/system-overview.md`
4. `docs/commands/command-reference.md`
5. Relevant project pack under `packages/project-packs/<project>/`
6. Relevant project memory under `storage/memory/projects/<project>/`

## Execution protocol

For any meaningful task:

1. Identify the target project or create a project context if none exists.
2. Load project context, decision log, active tasks, and risk register.
3. Route to relevant senior agents.
4. Load only the relevant skills.
5. Select decision engines for tradeoffs, review, and risk.
6. Select the workflow and deliverable template.
7. Check governance and approval rules.
8. Produce an execution plan if the task affects architecture, data, security, providers, automation, finance, or release.
9. Execute in small steps.
10. Run validation, tests, evals, or quality gates.
11. Update docs, memory, task state, decision log, and traces.
12. Report changes, verification, and remaining risks.

## Hard boundaries

Do not silently:

- delete data,
- deploy,
- spend money,
- send external messages,
- expose secrets,
- bypass governance,
- create live trading signals or execution systems,
- invent APIs or project facts.

## Useful commands

```bash
pnpm council status
pnpm council route "<task>"
pnpm council context <Project> "<task>"
pnpm governance:doctor
pnpm evals:run
pnpm gates:run
pnpm final:validate
```
