
# AI Council Decision Engines System

## Purpose

Decision engines turn expert knowledge into repeatable reasoning processes. They prevent the Council from jumping directly from request to code, design, or advice without framing the decision first.

## Why this layer exists

Skills contain knowledge. Senior agents contain roles. Decision engines contain **judgment structure**.

A good decision engine answers:

- What exactly are we deciding?
- What options exist?
- What criteria matter?
- What are the tradeoffs?
- What risks could break the recommendation?
- What evidence would change the decision?
- What should happen next?

## Current count

- Decision engines: **37**
- Main path: `packages/decision-engines`
- Registry: `packages/decision-engines/registry.md`
- Machine index: `packages/decision-engines/index.json`

## Usage flow

```text
User request
  ↓
Orchestrator frames task
  ↓
Agent router selects senior agents
  ↓
Engine router selects decision engine
  ↓
Engine loads relevant skills
  ↓
Decision memo is produced
  ↓
Implementation, review, or handoff begins
```

## When a decision engine is required

Use a decision engine whenever the task involves:

- architecture choices,
- system design,
- financial/trading risk,
- security or privacy,
- product direction,
- brand direction,
- release readiness,
- legal/compliance triage,
- unclear tradeoffs,
- expensive or hard-to-reverse changes.

## When it is not required

Do not force a decision engine for trivial edits, simple translations, small copy changes, or tasks where the decision has already been made.

## Quality standard

Every engine must include:

- `ENGINE.md`
- `engine.json`
- workflow
- rubric
- preflight checklist
- quality gate checklist
- decision memo template
- invoke prompt
- example output

## Financial and trading boundary

Trading and investment engines are for education, research, journaling, and risk review. They must not act as signal services, guarantee returns, or provide personalized financial advice.
