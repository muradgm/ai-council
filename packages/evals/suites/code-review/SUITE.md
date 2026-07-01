# Code Review Eval Suite

## Purpose

This suite checks whether AI Council can handle `engineering` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: code-reviewer, qa-engineer
- Engines: code-review-engine, testing-strategy-engine
- Workflows: code-review
- Skills: code-review, testing
- Templates: code-review-report

## Pass threshold

`0.8` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
