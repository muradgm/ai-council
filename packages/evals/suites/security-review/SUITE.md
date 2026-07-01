# Security Review Eval Suite

## Purpose

This suite checks whether AI Council can handle `security` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: cybersecurity-engineer
- Engines: security-review-engine, privacy-engine
- Workflows: security-review
- Skills: security
- Templates: security-review-report

## Pass threshold

`0.85` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
