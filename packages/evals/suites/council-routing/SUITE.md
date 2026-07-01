# Council Routing Eval Suite

## Purpose

This suite checks whether AI Council can handle `core` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: router, project-manager
- Engines: ai-agent-design-engine
- Workflows: codex-session
- Skills: core-reasoning, agent-design
- Templates: council-session-report

## Pass threshold

`0.8` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
