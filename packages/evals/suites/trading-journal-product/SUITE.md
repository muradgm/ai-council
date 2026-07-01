# Trading Journal Product Eval Suite

## Purpose

This suite checks whether AI Council can handle `product-trading` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: product-manager, forex-trader, risk-manager
- Engines: product-strategy-engine, trading-risk-engine
- Workflows: feature-planning, trading-system-review
- Skills: trading-journal, product-management, risk-management
- Templates: prd, trade-journal-entry, risk-review-report

## Pass threshold

`0.85` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
