# Evals + Quality Gates System

Phase 9 adds a measurable quality layer to AI Council.

## Why this matters

Without evals, the Council can become a large collection of impressive-looking files with no way to prove whether the routing, reasoning, and deliverables are improving. Evals make progress visible.

## What gets measured

| Area | What is checked |
|---|---|
| Routing | Whether the right agents, skills, engines, workflows, and templates are selected. |
| Reasoning | Whether the answer has assumptions, tradeoffs, risks, and decision criteria. |
| Deliverables | Whether outputs follow the required template and contain acceptance criteria. |
| Safety | Whether high-risk domains use conservative boundaries. |
| Runtime | Whether memory, context packs, and project state are available. |
| Repository integrity | Whether required files, manifests, docs, and scripts exist. |

## How to use in Codex

Before a major implementation:

```bash
pnpm council route "<task>"
pnpm evals:route "<task>"
pnpm gates:run
```

After implementation:

```bash
pnpm validate:knowledge
pnpm evals:run
pnpm gates:run
```

## Quality gate philosophy

A quality gate should not be bureaucratic. It should catch predictable failure modes:

- wrong expert selected,
- missing risk review,
- shallow PRD,
- no acceptance criteria,
- no security review,
- trading advice without risk boundaries,
- architecture decisions without tradeoffs,
- code changes without tests or docs.

## High-risk domains

Forex, trading, finance, security, legal, and health-adjacent work require stricter standards. The Council may analyze, educate, structure, backtest, and document. It should not promise profit, guarantee outcomes, or produce reckless instructions.
