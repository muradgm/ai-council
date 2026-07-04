# AI Council

## Project Summary

AI Council is an intelligent senior technical operating system for builders.

It understands real project context, routes work to specialist agents, makes technical judgments, plans governed actions, validates results, and helps builders move from idea to execution safely.

The system is not intended to be a simple chatbot, a roleplay agent group, a single coding assistant, an unsafe autonomous executor, or a wrapper around one model provider. It is designed as an intelligent technical operating layer that can support many future projects, many programming languages, many tools, and many levels of reasoning.

Its core architecture is:

```txt
Reusable AI Core
  +
Project Config
  +
Domain Agents
  +
Tool Permissions
  +
Memory Scope
  +
Evaluation Suite
  +
Learning Loop
  +
Hybrid Provider Router
```

The goal is to create a serious AI technical partner that can help with architecture, coding, debugging, product thinking, security, testing, refactoring, documentation, and long-term project evolution.

---

## The Wedge

### Strong Wedge

**AI Council starts as the local-first AI Tech Lead that understands your project, routes work to specialist agents, plans safe actions, validates results, and gives you the next best move.**

This is the wedge because it is narrow enough to build, but painful enough to matter.

Most AI coding tools focus on generating code quickly. AI Council focuses on helping the builder make better technical decisions before, during, and after code generation.

The first target user is not "everyone who uses AI." The first target user is:

```txt
A technical solo founder / builder
who has several software ideas
works across multiple stacks
uses local and cloud AI tools
cares about privacy and cost
needs architecture help
needs code review
needs project memory
needs repeatable workflows
and wants the AI system to improve over time.
```

The wedge is not:

- "Another ChatGPT clone"
- "Another Cursor clone"
- "A generic AI dashboard"
- "A MERN-only code generator"
- "A one-model wrapper"

The wedge is:

> **A reusable AI Tech Lead layer for builders managing many projects, many tools, many languages, and many AI models.**

---

## Why This Should Exist

Modern builders face a new problem: AI tools are powerful, but fragmented.

A builder may use:

- ChatGPT for reasoning
- Claude for code review
- Gemini for research
- DeepSeek for cheaper coding help
- Ollama for local/private tasks
- Git locally
- VS Code or Cursor
- terminal tools
- Docker
- databases
- design tools
- project docs
- personal notes

But these tools usually do not share:

- project memory
- decision history
- architecture rules
- safety policies
- coding standards
- evaluation results
- reusable agent workflows
- consistent project context

AI Council solves that gap.

It becomes the coordination layer between the user, projects, agents, tools, memory, evaluations, and model providers.

---

## Product Purpose

AI Council exists to help a builder do the following:

1. **Think better**
   - Challenge assumptions
   - Compare trade-offs
   - Detect weak reasoning
   - Ask the right technical questions

2. **Build better**
   - Plan features
   - Review architecture
   - Generate implementation steps
   - Coordinate frontend, backend, database, security, DevOps, and QA concerns

3. **Work safer**
   - Respect tool permissions
   - Keep secrets local
   - Require approval for dangerous operations
   - Sanitize requests before sending them to external providers

4. **Reuse knowledge**
   - Store project decisions
   - Maintain project-specific context
   - Keep agent memory scoped and auditable

5. **Improve over time**
   - Collect feedback
   - Detect repeated failures
   - Generate evaluations from mistakes
   - Propose improvements
   - Require review before production behavior changes

---

## Core System Concept

AI Council works through specialized agents and councils.

Instead of sending every task to one general AI, the system routes work to the right set of specialists.

Example councils:

```txt
Coding Council
├─ Software Architect
├─ Language Specialist
├─ Implementation Agent
├─ QA Engineer
└─ Code Reviewer

Architecture Council
├─ Software Architect
├─ Backend Engineer
├─ Database Architect
├─ DevOps Engineer
├─ Security Architect
└─ Cost/Performance Agent

Security Council
├─ Security Architect
├─ Threat Modeler
├─ AppSec Reviewer
├─ Privacy Reviewer
└─ Red Team Agent

Product Council
├─ Product Strategist
├─ UX Strategist
├─ Market Researcher
├─ Founder Operator
└─ Monetization Agent
```

Each project can define its own agents, tools, memory scope, permissions, and evaluation suite.

---

## Hybrid AI Strategy

AI Council should not depend on one provider.

The model strategy is:

```txt
Tier 1 — Local Council
Use local models for private, cheap, low-risk, always-available work.

Tier 2 — Freemium / Low-Cost Cloud AI
Use providers like DeepSeek, Gemini free tier, Grok/xAI if available, Mistral, and OpenRouter for mid-level reasoning, coding, and second opinions.

Tier 3 — Premium AI
Use OpenAI, Claude, Gemini Pro, Claude Code, and other premium models for complex architecture, security, production refactors, high-stakes logic, and major project decisions.
```

The router should consider:

- task type
- risk level
- privacy level
- estimated cost
- model capability
- model availability
- historical performance
- user preference
- confidence score

Default rule:

> Start local. Escalate only when the task justifies the cost, risk, or complexity.

---

## Local-First Principle

AI Council should be local-first by default.

Local means:

- source code stays on the user's machine unless explicitly shared
- secrets stay local
- dangerous tools require approval
- local models can handle private drafts and analysis
- local memory can be separated from cloud memory
- the user remains in control

Cloud is useful for:

- dashboard access
- backups
- evaluation reports
- trace analysis
- scheduled workflows
- provider routing
- long-running jobs
- premium model execution

But cloud should coordinate, not blindly control the local machine.

---

## What AI Council Must Not Become

AI Council must not become:

1. **A fragile automation monster**
   - It should not randomly run shell commands, delete files, deploy code, or rewrite configs without approval.

2. **A prompt-only toy**
   - Agents need contracts, tests, evaluations, permissions, memory rules, and traceability.

3. **A single-provider wrapper**
   - It should support local, freemium, and premium providers.

4. **A TypeScript-only assistant**
   - It must support major languages and platforms through adapters.

5. **A black box**
   - Important decisions should be traceable, reviewable, and explainable.

6. **A self-modifying system without gates**
   - The learning loop may propose changes, but production behavior needs evaluation, versioning, human review, and rollback.

---

## Version Roadmap

### Version 0.1 — Runnable Scaffold

Goal: make the repo install, build, test, and run basic CLI/web/API flows.

Includes:

- monorepo bootstrap
- TypeScript config
- CLI scaffold
- API scaffold
- web console scaffold
- orchestrator scaffold
- core agent registry
- basic councils
- memory manager stub
- tool registry stub
- provider router stub
- learning-loop stub
- eval runner stub
- project config examples

Success criteria:

```txt
pnpm install
pnpm build
pnpm test
pnpm council smoke
pnpm dev:web
pnpm dev:api
```

---

### Version 0.2 — Real Local Execution

Goal: make the local AI Council useful without external providers.

Includes:

- Ollama integration
- local provider health checks
- local model registry
- local prompt execution
- local project scanner
- file reading with permissions
- basic repo analysis
- local memory storage
- CLI commands for project review

Success criteria:

```txt
ai-council ask "Review this project architecture"
ai-council project scan
ai-council council run architecture
```

---

### Version 0.3 — Project-Aware AI Core

Goal: make project configs meaningful.

Includes:

- project loader
- project-specific memory
- project-specific knowledge
- project-specific tool permissions
- project-specific evals
- council selection based on project context
- agent output schemas
- trace logs

Success criteria:

```txt
ai-council project use signalscout
ai-council ask "Plan the next backend feature"
```

The answer should reflect SignalScout's actual project rules, stack, memory, and constraints.

---

### Version 0.4 — Hybrid Provider Router

Goal: support local, freemium, and premium AI routing.

Includes:

- DeepSeek provider
- Gemini provider
- Grok/xAI provider
- Mistral provider
- OpenRouter provider
- OpenAI provider
- Anthropic provider
- Gemini Pro provider
- cost engine
- privacy engine
- fallback engine
- confidence engine
- provider benchmarking

Success criteria:

```txt
ai-council ask "Review this security-sensitive auth flow" --risk high
```

The system should choose a stronger provider, sanitize context, and explain the routing decision.

---

### Version 0.5 — Evaluations and Guardrails

Goal: prevent regressions and unsafe behavior.

Includes:

- golden evals
- regression evals
- coding evals
- security evals
- prompt-injection tests
- output validators
- tool permission tests
- provider routing tests
- learning-loop tests

Success criteria:

```txt
pnpm eval
pnpm eval:security
pnpm eval:routing
```

No production release should happen unless required evals pass.

---

### Version 0.6 — Learning Loop

Goal: make the system improve safely.

Includes:

- feedback collector
- trace analyzer
- failure miner
- lesson extractor
- eval generator
- prompt improver
- agent improver
- human review queue
- release gates
- rollback manager

Important rule:

> The system can learn constantly, but it cannot silently update production behavior.

Success criteria:

```txt
ai-council feedback "The backend agent ignored database constraints"
ai-council learning analyze
ai-council learning propose
ai-council learning approve
```

---

### Version 0.7 — Web Console

Goal: provide a clear interface for managing the system.

Includes:

- agent dashboard
- council dashboard
- provider usage dashboard
- memory browser
- trace viewer
- eval dashboard
- learning-loop review queue
- project registry
- tool permission management

Success criteria:

The user can inspect and manage the AI Council without using only the terminal.

---

### Version 1.0 — AI Tech Lead Platform

Goal: make AI Council genuinely useful as a daily technical partner.

Includes:

- local-first project assistant
- real provider routing
- real council execution
- real memory
- real evaluations
- real tool permissions
- safe CLI
- useful web console
- project-aware workflows
- documentation
- tests
- release gates

Version 1.0 should be good enough to support real projects such as:

- SignalScout
- GateZero
- Motio
- Lango
- Navo / Flowday
- Brandentity
- future apps

---

## Future Version: AI Operating System

Beyond v1, AI Council can evolve into a complete AI operating system for builders.

Possible future modules:

- desktop app
- mobile companion app
- voice interface
- multimodal project understanding
- design-tool integration
- self-hosted Git integration
- local code execution sandbox
- plugin marketplace
- team collaboration
- multi-user permissions
- distributed agent execution
- scheduled autonomous jobs
- project analytics
- cost budgets
- model benchmarking dashboard
- knowledge graph
- memory graph
- agent marketplace
- workflow builder
- visual council editor

Future vision:

> AI Council becomes the operating layer between human intent, software projects, AI models, tools, memory, evaluation, and execution.

---

## Business / Product Positioning

### Category

AI Council belongs between:

- AI coding assistant
- agent orchestration platform
- local AI runtime
- developer productivity tool
- technical decision system
- AI project operating system

### Initial positioning

```txt
AI Council is a local-first AI Tech Lead for builders managing multiple serious software projects.
```

### Expanded positioning

```txt
AI Council is a hybrid AI operating layer that coordinates agents, models, tools, memory, and evaluations across all of your projects.
```

### Long-term positioning

```txt
AI Council is the personal AI engineering organization for solo founders, builders, and small teams.
```

---

## Differentiation

AI Council is different because it combines:

- local-first execution
- multi-model routing
- agent councils
- project-specific memory
- tool permissions
- evaluation gates
- learning-loop governance
- multi-language support
- provider independence
- reusable project architecture

The value is not "many agents" and not only "AI writes code."

The value is:

> AI Council gives builders senior technical judgment and safe execution support across real projects.

---

## Product Principles

1. **Local-first, not local-only**
2. **Provider-independent**
3. **Project-aware**
4. **Permissioned tools**
5. **Traceable decisions**
6. **Evaluation before automation**
7. **Human approval for risky actions**
8. **No silent self-modification**
9. **Language-agnostic**
10. **Useful before it is impressive**

---

## North Star

The north star is:

> A builder can open any project, ask AI Council what to build next, how to build it safely, what risks exist, and what files/tools/agents are needed — then receive a structured, reviewed, testable implementation plan.

Eventually, the system should be able to help execute that plan, but only inside clear permission boundaries.

---

## First Real Use Case

The first real use case should be:

```txt
Project-aware architecture and code review for one local project.
```

This is the strongest first use case because it proves the core loop:

```txt
Load project
Read config
Understand structure
Select council
Use local model
Generate review
Store trace
Run eval
Collect feedback
Improve workflow
```

If this works, the platform has a real foundation.

---

## Immediate Build Priorities

1. Make the repo build reliably.
2. Implement Ollama provider.
3. Implement project loader.
4. Implement file scanner with permissions.
5. Implement real agent prompt execution.
6. Implement trace storage.
7. Implement first project review workflow.
8. Implement basic evals.
9. Implement feedback capture.
10. Add one real project: SignalScout or AI Council itself.

---

## Final Product Thesis

AI Council is not valuable because it has many agents.

It is valuable if those agents create better decisions, safer execution, reusable knowledge, and measurable improvement over time.

The first version should be boring, reliable, and useful.

The future version can be powerful.

Build the boring foundation first.


# Workflow Orchestration Layer

Phase 5 makes AI Council operational by adding workflow-driven execution. Workflows bind together agents, skills, and decision engines into repeatable processes for product, engineering, design, AI, business, trading, finance, and documentation work.

The workflow layer should become the default entry point for complex work in Codex.
