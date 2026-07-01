# Architecture Review Eval Suite

## Purpose

This suite checks whether AI Council can handle `engineering` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: principal-software-architect, cto
- Engines: architecture-engine, database-engine
- Workflows: architecture-review
- Skills: software-architecture, database
- Templates: architecture-decision-record, technical-design-doc

## Pass threshold

`0.8` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
