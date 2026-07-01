# Project Packs System

## Purpose

Project Packs turn AI Council from a general expert system into a project-aware execution system.

They define:

- product purpose
- wedge
- target users
- current stage
- architecture direction
- roadmap
- active tasks
- risk register
- decision history
- Codex context
- relevant agents, skills, workflows, templates, and decision engines

## Operating rule

Before working on a named product, load its project pack first.

The minimum reading order is:

1. `packages/project-packs/<project>/PROJECT_PACK.md`
2. `packages/project-packs/<project>/codex/CODEX_CONTEXT.md`
3. `packages/project-packs/<project>/tasks/ACTIVE_TASKS.md`
4. `packages/project-packs/<project>/decisions/DECISION_LOG.md`
5. `storage/memory/projects/<Project>/project-context.md`

## Non-negotiable behavior

- Do not invent project direction when the pack already defines it.
- Do not create duplicate architecture without checking the project pack.
- Update active tasks and decision log after meaningful changes.
- Record uncertainties in the risk register or open questions section.
- Keep trading and finance projects risk-first and non-advisory.
