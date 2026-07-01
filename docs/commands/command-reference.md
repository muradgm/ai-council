# Command Reference

This is the hand-written v2.0.0 command overview. A generated script inventory can be produced with:

```bash
pnpm docs:commands
```

## Core

```bash
pnpm council help
pnpm council status
pnpm council doctor
pnpm council health
pnpm council map
pnpm final:validate
pnpm release:status
```

## Routing and context

```bash
pnpm council route "<request>"
pnpm council context <Project> "<task>"
pnpm council bootstrap <Project> "<task>"
```

## Skills, agents, engines, workflows, templates

```bash
pnpm skills:list
pnpm agents:list
pnpm agents:route "<request>"
pnpm engines:list
pnpm engines:route "<request>"
pnpm workflows:list
pnpm workflows:route "<request>"
pnpm templates:list
pnpm templates:route "<request>"
pnpm deliverables:generate <template> "<topic>"
```

## Memory and project runtime

```bash
pnpm memory:init
pnpm memory:status
pnpm project:context <Project>
pnpm memory:context <Project> "<task>"
pnpm memory:decision <Project> "<decision>"
pnpm memory:session <Project> "<summary>"
pnpm memory:task <Project> "<task>"
pnpm runtime:index
pnpm runtime:context <Project> "<task>"
pnpm runtime:run <Project> "<task>"
pnpm runtime:eval
```

## Evals and quality gates

```bash
pnpm evals:list
pnpm evals:route "<request>"
pnpm evals:run
pnpm gates:run
pnpm evals:report
```

## Providers and tools

```bash
pnpm providers:list
pnpm providers:route "<request>"
pnpm providers:health
pnpm providers:policy <policy-name>
pnpm tools:list
pnpm tools:check "<request>"
```

## Observability

```bash
pnpm observability:init
pnpm observability:status
pnpm trace:run <project> <task> <summary>
pnpm trace:provider <provider> <purpose> <tier> <cost>
pnpm trace:artifact <path> <type> <description>
pnpm trace:cost <category> <amount> <currency> <description>
pnpm diagnostics:report
pnpm observability:report
pnpm artifacts:list
```

## Project packs

```bash
pnpm project-packs:list
pnpm project-packs:route "<request>"
pnpm project-pack:status
pnpm project-pack:context <project> "<task>"
pnpm project-pack:sync
```

## Automation

```bash
pnpm automation:init
pnpm automation:status
pnpm backlog:add <project> "title" "description"
pnpm backlog:list <project>
pnpm sprint:plan <project> "goal"
pnpm task:queue add <project> "task"
pnpm github:issue <project> "task"
pnpm codex:task <project> "task"
pnpm release:checklist <project> "scope"
pnpm docs:update <project> "change"
pnpm automation:report
```

## Governance

```bash
pnpm governance:init
pnpm governance:status
pnpm governance:doctor
pnpm permissions:check "action"
pnpm approvals:request <project> "action" <risk>
pnpm approvals:list
pnpm secrets:scan
pnpm prompt-injection:check "text"
pnpm finance:governance "request"
pnpm audit:record <kind> "summary"
pnpm governance:report
```

## Web console

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:api:lan
pnpm dev:web:lan
pnpm apps:setup
pnpm console:status
pnpm console:snapshot
pnpm council console
```
