# System Overview

AI Council v2 is a modular monorepo for coordinating AI-assisted product work.

## Core architecture

```text
User request
    ↓
Council CLI / Codex / Web Console
    ↓
Orchestrator
    ↓
Project runtime + memory
    ↓
Routing
    ├─ Senior agents
    ├─ Skills
    ├─ Decision engines
    ├─ Workflows
    └─ Templates
    ↓
Governance + approval gates
    ↓
Execution / deliverable generation
    ↓
Validation / evals / quality gates
    ↓
Observability traces + memory/doc updates
```

## Package responsibilities

| Package | Responsibility |
|---|---|
| `orchestrator` | Startup, routing, operating protocol |
| `skills` | Modular reusable capabilities |
| `senior-agents` | Expert roles and perspectives |
| `decision-engines` | Structured reasoning, scoring, tradeoff review |
| `workflows` | Repeatable end-to-end processes |
| `templates` | Standard deliverable formats |
| `memory` | Project state, decisions, sessions, context packs |
| `project-packs` | Product-specific strategy and execution context |
| `automation` | Backlog, sprint, task, release, and docs automation |
| `governance` | Permission, approval, security, and finance boundaries |
| `ai-providers` | Local/cloud model routing policy |
| `tool-contracts` | Tool permission and safety contracts |
| `evals` | Evaluation suites and quality gates |
| `observability` | Traces, diagnostics, artifacts, and costs |

## Key design choice

Skills, agents, workflows, and decision engines are separate. This prevents duplication and lets the orchestrator compose the right Council for each task.
