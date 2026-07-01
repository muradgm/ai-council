# Workflow Execution Eval Suite

## Purpose

This suite checks whether AI Council can handle `workflow` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: project-manager
- Engines: release-readiness-engine
- Workflows: build-execution, release-readiness
- Skills: project-management, testing
- Templates: release-readiness-report

## Pass threshold

`0.8` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
