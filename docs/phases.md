# AI Council v2 Phased Build Plan

## Phase 1 — Foundation and Bootstrap

Status: included.

Purpose: create a clean, runnable foundation that future phases can extend.

Includes:
- root agent instructions
- orchestrator package
- skill specification
- senior agent specification
- decision engine specification
- validation script
- seed skills, agents, and decision engines

## Phase 2 — Skill Library Expansion

Goal: expand `packages/skills` into a broad, practical knowledge library.

Target:
- 75–150 skills
- consistent `SKILL.md` files
- manifests
- workflows
- templates
- checklists

Priority domains:
- engineering
- AI engineering
- design and branding
- entrepreneurship
- product
- marketing
- finance and trading
- legal/risk basics

## Phase 3 — Senior Agent Roster

Goal: build a full council of senior experts.

Target:
- 40–80 senior agents
- role-specific instructions
- skill dependencies
- workflows
- review checklists

## Phase 4 — Decision Engines

Goal: make reasoning repeatable and auditable.

Target:
- architecture engine
- product engine
- code review engine
- security engine
- trading/risk engine
- brand engine
- startup engine

## Phase 5 — Executable Orchestrator

Goal: move from markdown orchestration to runnable TypeScript orchestration.

Target:
- CLI commands
- skill discovery
- agent routing
- project context loading
- validation reports
- memory adapters

## Phase 6 — Evaluation and Quality System

Goal: verify council output quality.

Target:
- eval datasets
- golden examples
- regression tests
- rubric-based scoring
- deliverable review reports

## Phase 7 — Product Integrations

Goal: connect AI Council to real products like TradeFrame, SignalScout, NAVO/Flowday, and future apps.


## Phase 02 — Skills Layer

Adds the complete modular `packages/skills` system.

Included:

- 70+ reusable skills
- `SKILL.md` per skill
- `skill.json` manifest per skill
- workflows, templates, checklists, examples, prompts, references
- `skills.index.json`
- `INDEX.md`
- documentation for the skill system
- expanded validation rules

Run:

```bash
pnpm validate:knowledge
pnpm skills:list
```


## Phase 03 — Senior Agents Layer

Adds the expert roster layer under `packages/senior-agents`.

Included:

- 45+ senior agents
- executive, startup, product/design, engineering, marketing/sales, finance/trading, research/ops groups
- `AGENT.md` per agent
- `agent.json` manifest per agent
- skill maps connecting agents to `packages/skills`
- routing policy
- `agents.index.json`
- list and routing scripts
- expanded validation rules

Run:

```bash
pnpm validate:knowledge
pnpm agents:list
pnpm agents:route "build an AI trading journal app"
```


## Phase 04 — Decision Engines Layer

Status: complete in `ai-council-v2-phase-04-decision-engines-layer.zip`.

Adds:

- 37 decision engines.
- Engine registry and machine index.
- Engine routing script.
- Engine run/dry-run script.
- Decision memo templates.
- Scoring rubrics and quality gates.
- Expanded validation.

Commands:

```bash
pnpm engines:list
pnpm engines:route "review the architecture for my trading app"
pnpm engines:run "should we use PostgreSQL or MongoDB for SignalScout?"
```


## Phase 10 — Provider + Tool Integration Layer

Adds provider routing, local/cloud policies, tool contracts, safe execution boundaries, provider health checks, and integration documentation.

## Phase 11 — Storage, Observability + Trace Layer

Adds structured runtime evidence, run traces, artifact registry, provider-call traces, cost tracking, diagnostics, and observability reports.


## Phase 12 — Apps + Web Console Layer

Adds a local dashboard for browsing Council assets, routing tasks, inspecting project memory, and viewing observability records.

Run:

```bash
pnpm dev:api
pnpm dev:web
```


## Phase 14 — Automation + Task Execution Layer

Adds backlog, task queue, sprint planning, GitHub issue drafts, Codex task prompts, release checklists, documentation update plans, and automation reports.

## Phase 15 — Security, Permissions + Governance Layer

Adds governance package, permissions, approval gates, prompt-injection defenses, secrets policy, trading/finance governance, audit records, and human-review boundaries.
