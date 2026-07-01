# Project Runtime Eval Suite

## Purpose

This suite checks whether AI Council can handle `memory` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: project-manager
- Engines: documentation-engine
- Workflows: project-kickoff
- Skills: project-management, documentation
- Templates: project-brief

## Pass threshold

`0.8` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
