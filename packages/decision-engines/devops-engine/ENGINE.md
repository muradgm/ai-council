
# DevOps Engine

## Purpose

Evaluate CI/CD, environments, deployment flow, observability, infrastructure reliability, and rollback plans.

## When to use this engine

Use this engine when the Council must make or review a **delivery operations decision**. It is designed for decisions where tradeoffs, risk, and evidence quality matter more than quick surface-level answers.

## Inputs

- User request or decision question.
- Current project context and repository state.
- Constraints: time, budget, technical stack, user needs, risk tolerance.
- Known facts and evidence.
- Candidate options if already available.
- Relevant senior agents and skills.

## Required skill dependencies

- `devops`
- `docker`

## Owner / reviewer agents

- `devops-engineer`
- `cto`
- `principal-software-architect`

## Operating principles

1. Define the decision before judging options.
2. Separate facts from assumptions.
3. Generate at least two viable options unless only one is technically possible.
4. Score options using the rubric.
5. Identify failure modes before recommending action.
6. Prefer the simplest reversible decision that preserves future optionality.
7. State confidence and what would change the recommendation.

## Core rubric

- **Environment Parity**: score from 1-5 and justify the score.
- **Deployment Safety**: score from 1-5 and justify the score.
- **Rollback Clarity**: score from 1-5 and justify the score.
- **Observability**: score from 1-5 and justify the score.
- **Secret Handling**: score from 1-5 and justify the score.
- **Cost Control**: score from 1-5 and justify the score.
- **Automation**: score from 1-5 and justify the score.

## Guardrails

- Do not overstate confidence. Use evidence, assumptions, and escalation when stakes are material.
- Do not fabricate facts, benchmarks, market data, laws, prices, or performance numbers.
- If the decision depends on recent external information, require fresh research before final commitment.
- For high-stakes domains, recommend expert review rather than pretending the Council is sufficient.

## Standard output

```md
# DevOps Engine Decision Memo

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
