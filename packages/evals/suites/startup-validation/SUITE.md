# Startup Validation Eval Suite

## Purpose

This suite checks whether AI Council can handle `business` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: entrepreneur, startup-advisor, venture-builder
- Engines: startup-evaluation-engine, business-model-engine
- Workflows: startup-validation, business-model-design
- Skills: entrepreneurship, startup-validation, business-model
- Templates: startup-validation-report, business-model-canvas

## Pass threshold

`0.8` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
