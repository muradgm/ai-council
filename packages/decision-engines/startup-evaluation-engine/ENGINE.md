
# Startup Evaluation Engine

## Purpose

Evaluate startup concepts, wedges, market timing, customer pain, defensibility, and execution path.

## When to use this engine

Use this engine when the Council must make or review a **startup viability decision**. It is designed for decisions where tradeoffs, risk, and evidence quality matter more than quick surface-level answers.

## Inputs

- User request or decision question.
- Current project context and repository state.
- Constraints: time, budget, technical stack, user needs, risk tolerance.
- Known facts and evidence.
- Candidate options if already available.
- Relevant senior agents and skills.

## Required skill dependencies

- `entrepreneurship`
- `business-model`
- `product-strategy`

## Owner / reviewer agents

- `entrepreneur`
- `startup-advisor`
- `venture-builder`
- `ceo`
- `market-researcher`

## Operating principles

1. Define the decision before judging options.
2. Separate facts from assumptions.
3. Generate at least two viable options unless only one is technically possible.
4. Score options using the rubric.
5. Identify failure modes before recommending action.
6. Prefer the simplest reversible decision that preserves future optionality.
7. State confidence and what would change the recommendation.

## Core rubric

- **Pain Intensity**: score from 1-5 and justify the score.
- **Buyer Clarity**: score from 1-5 and justify the score.
- **Wedge Strength**: score from 1-5 and justify the score.
- **Speed To Revenue**: score from 1-5 and justify the score.
- **Competitive Pressure**: score from 1-5 and justify the score.
- **Defensibility**: score from 1-5 and justify the score.
- **Founder Fit**: score from 1-5 and justify the score.

## Guardrails

- Do not overstate confidence. Use evidence, assumptions, and escalation when stakes are material.
- Do not fabricate facts, benchmarks, market data, laws, prices, or performance numbers.
- If the decision depends on recent external information, require fresh research before final commitment.
- For high-stakes domains, recommend expert review rather than pretending the Council is sufficient.

## Standard output

```md
# Startup Evaluation Engine Decision Memo

## Decision

Recommended option: [option]
Confidence: [low / medium / high]

## Context

What is being decided and why it matters.

## Options Considered

1. Option A
2. Option B
3. Option C, if relevant

## Rubric Scores

| Criterion | Option A | Option B | Option C | Notes |
|---|---:|---:|---:|---|
| Criterion 1 | 1-5 | 1-5 | 1-5 | Evidence |

## Tradeoffs

- What improves.
- What gets worse.
- What stays uncertain.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|

## Recommendation

Clear decision and why.

## Next Actions

1. First concrete step.
2. Validation step.
3. Documentation/update step.

## What Would Change This Decision

Specific evidence or constraint changes.
```
