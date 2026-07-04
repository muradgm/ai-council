# AI Council v2.0.0

AI Council is a modular AI operating system for building, reviewing, and managing product work with specialist agents, reusable skills, decision engines, workflows, templates, memory, governance, automation, provider routing, observability, and a local web console.

This repository is designed to be used with Codex, ChatGPT, Claude Code, Gemini CLI, local models, or any capable coding agent. The repository is the source of truth. The model is the reasoning engine operating on it.

## What is included

| Layer | Purpose |
|---|---|
| `packages/orchestrator` | Bootstrap, routing, planning, and execution rules |
| `packages/skills` | Modular `SKILL.md` capability folders |
| `packages/senior-agents` | Executive and specialist expert roles |
| `packages/decision-engines` | Reusable reasoning engines and rubrics |
| `packages/workflows` | End-to-end repeatable workflows |
| `packages/templates` | Deliverable templates and example outputs |
| `packages/memory` | Project context, decisions, sessions, and task state |
| `packages/evals` | Regression evals and quality gates |
| `packages/ai-providers` | Local/cloud model provider routing policies |
| `packages/tool-contracts` | Tool-use boundaries and contracts |
| `packages/observability` | Run traces, costs, diagnostics, and artifacts |
| `packages/project-packs` | Product-specific packs for TradeFrame, SignalScout, NAVO/Flowday, and Swimly |
| `packages/automation` | Backlog, sprint, task, release, GitHub, and Codex task automation |
| `packages/governance` | Permissions, approvals, security, prompt-injection defense, and trading boundaries |
| `apps/web-console` | Codex-style local console for Council conversations, data, runtime, projects, and catalog browsing |
| `apps/api-server` | Local API for the console |

## Quick start

```bash
pnpm install
pnpm validate:knowledge
pnpm final:validate
pnpm council status
```

Start the local console:

```bash
pnpm dev:api
pnpm dev:web
```

Open:

```text
http://localhost:5173
```

For local model-backed answers, install Ollama and pull the default model:

```bash
winget install --id Ollama.Ollama -e
ollama pull llama3.1
```

The core Council runtime now uses a structured agent result contract for the first model-backed specialists: software architect, security architect, QA engineer, and final synthesizer. These agents return findings, risks, uncertainties, next actions, recommendations, and confidence. If a local model is unavailable or returns unusable output, the runtime falls back to a deterministic evidence-based result instead of presenting placeholder intelligence.

Repo-review requests to the local API also load a bounded set of source snippets from the AI Council repository. The orchestrator passes those `Source:` citations into specialist agents so findings can point at real files instead of only the user request.

For phone/tablet access on the same Wi-Fi network:

```bash
pnpm dev:api:lan
pnpm dev:web:lan
```

Then open `http://<your-computer-ip>:5173` on the mobile device. The browser app will automatically use `http://<your-computer-ip>:3333` for the local API.

## Start a Codex session

Use this exact startup prompt:

```text
Read AGENTS.md, packages/orchestrator/bootstrap.md, and docs/codex-master-startup.md.
Then initialize AI Council for the current repository.
Before editing code, identify the target project, load its context, route to agents/skills/workflows/engines, check governance, and produce a short execution plan.
```

For a project-specific context pack:

```bash
pnpm council context TradeFrame "build the trading journal MVP"
```

## Recommended operating loop

```text
Request → project context → routing → plan → governance check → execute → validate → trace → update memory/docs
```

## Core commands

```bash
pnpm council help
pnpm council status
pnpm council doctor
pnpm council route "build an AI trading journal feature"
pnpm runtime:index
pnpm runtime:context TradeFrame "build the trading journal MVP"
pnpm runtime:run TradeFrame "review the trading journal MVP architecture"
pnpm runtime:eval
pnpm apps:setup
pnpm council act ai-council "create model-backed agent hardening plan" --dry-run
pnpm learning:feedback TradeFrame 4 "Response was grounded and actionable."
pnpm learning:report
pnpm council context TradeFrame "build the trading journal MVP"
pnpm evals:run
pnpm gates:run
pnpm governance:doctor
pnpm release:status
```

See the full command reference:

```text
docs/commands/command-reference.md
```

## Release status

This ZIP represents **AI Council v2.0.0**: architecture complete, knowledge system complete, and runtime entering MVP hardening. The right move now is not more foundation expansion; it is making one end-to-end Council loop reliable on actual product work, especially TradeFrame, SignalScout, NAVO/Flowday, and Swimly.
