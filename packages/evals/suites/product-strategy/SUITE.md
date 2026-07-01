# Product Strategy Eval Suite

## Purpose

This suite checks whether AI Council can handle `product` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: product-manager, cpo
- Engines: product-strategy-engine
- Workflows: product-discovery, feature-planning
- Skills: product-management, product-strategy
- Templates: prd, feature-spec

## Pass threshold

`0.8` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
