# Forex Trading Risk Eval Suite

## Purpose

This suite checks whether AI Council can handle `trading` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: forex-trader, risk-manager, quant-researcher
- Engines: forex-trade-review-engine, trading-risk-engine, quant-research-engine
- Workflows: forex-trade-review, trading-system-review, risk-review
- Skills: forex-trading, risk-management, technical-analysis
- Templates: forex-trading-plan, trade-journal-entry, risk-review-report

## Pass threshold

`0.9` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
