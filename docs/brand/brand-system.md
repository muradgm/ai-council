---
template: brand-system
title: AI Council Product Brand System
category: brand
owner: AI Council
status: draft
version: 0.1
scope: product-behavior-and-interface-brand
date: 2026-07-12
prepared_by: Senior Brand Designer / Product Design Lead
---

# AI Council Product Brand System

## Purpose

This document defines how AI Council behaves as a product brand across interface, language, motion, trust patterns, agent states, approvals, evaluations, and execution feedback.

It complements `docs/brand/ai-council-logo-design-brief.md`, which governs the logo and mark system. Do not treat the logo brief as the complete identity system.

## Brand Architecture

AI Council is an **Orchestrated Intelligence System** for builders.

| Layer | Role |
| --- | --- |
| AI Council | The product and operating layer. |
| Council Core | The coordination and decision metaphor. |
| Proof Loop | Evaluation and verification behavior. |
| Execution Ledger | Traceability and accountability behavior. |

## Brand Idea

```txt
Orchestrated Intelligence
```

AI Council should feel like a senior technical operating system: calm, evidence-backed, locally aware, governed, and practical.

It should not feel magical, theatrical, cute, chaotic, or like a generic chatbot with agent labels.

## Product Metaphor

AI Council operates through a governed loop:

```txt
Context -> Coordinate -> Evaluate -> Approve -> Execute -> Verify -> Remember
```

This loop should be visible in product behavior. A user should be able to see what context was used, which agents participated, what evidence mattered, whether approval is required, what was executed, whether validation passed, and what was recorded.

## Council Core Behavior

The Council Core is the product's coordination metaphor. It should represent alignment, evaluation, and governed decision-making.

Do not describe the Council Core as magical or alive. It does not "awaken." It activates.

Recommended behavior phrase:

```txt
Council Core activates, coordinates, evaluates, and settles.
```

## Council Core State Model

| State | Meaning | Visual behavior |
| --- | --- | --- |
| Dormant | No active process | Stable, low-emphasis mark. |
| Gathering | Loading context, memory, or agents | Nodes separate or softly activate. |
| Coordinating | Agents or tools are active | Controlled alignment or orbit behavior. |
| Evaluating | Comparing evidence, outputs, or checks | Core contracts or pulses once. |
| Approval required | Waiting for human authorization | Core pauses with a clear semantic indicator. |
| Executing | Approved action is in progress | Directional coordinated motion. |
| Verified | Output passed checks | Elements settle into equilibrium. |
| Blocked | Policy, permission, or validation failure | Motion stops; error treatment appears outside the logo. |
| Uncertain | Evidence is insufficient | Partial or incomplete alignment. |

These are branded behaviors, not alternate logos. Do not recolor the logo nodes to represent arbitrary states.

## Voice Principles

AI Council should speak like a senior technical partner.

It should:

- State the conclusion early.
- Distinguish facts, assumptions, and recommendations.
- Expose uncertainty.
- Name missing evidence.
- Use specific technical language.
- Say when validation has or has not run.
- Prefer one clear next move over many vague options.
- Keep tone calm, precise, and useful.

It should not:

- Use theatrical AI language.
- Over-praise ordinary user requests.
- Claim completion without validation.
- Hide uncertainty behind confident phrasing.
- Use motivational filler where evidence is needed.

Example:

```txt
The approach is viable, but two dependencies are unresolved.
```

Avoid:

```txt
Great idea! I'm excited to help you implement this.
```

## Trust Model

AI Council earns trust by showing:

- Reasoning inputs.
- Loaded context.
- Agent involvement.
- Evidence quality.
- Uncertainty.
- Permission and approval state.
- Validation outcomes.
- Ledger and memory records.

It should never imply that an answer is correct just because it came from a council. Council output must remain reviewable.

## Proof And Evaluation Patterns

The interface should visually distinguish:

| Artifact | Meaning |
| --- | --- |
| Agent opinion | Specialist judgement or interpretation. |
| Retrieved evidence | Context loaded from project files, memory, docs, or traces. |
| Tool output | Result returned by a command, provider, browser, repo scanner, or local service. |
| Test result | Automated validation output. |
| Evaluation score | Quality gate or rubric result. |
| Human approval | Explicit authorization from the user. |
| Final decision | Synthesized recommendation or selected next move. |
| Verified execution result | Completed action with validation and ledger record. |

Without this separation, governed intelligence becomes marketing language instead of product behavior.

## Color Systems

AI Council uses separate color systems for identity, surfaces, status, and data.

| System | Purpose | Notes |
| --- | --- | --- |
| Brand colors | Recognition and identity | Violet, blue, cyan. |
| Neutral colors | Surfaces, text, borders | Deep Space, Panel Navy, slate, white. |
| Semantic colors | Product status and risk | Success, warning, danger, information. |
| Data colors | Charts and comparisons | Accessible extended palette. |

The logo color order is stable:

```txt
Violet top -> Blue lower-left -> Cyan lower-right
```

Do not recolor logo nodes for approval, danger, or blocked states. Use separate badges, borders, panels, or status markers.

Semantic examples:

- Approved: green badge or success treatment.
- Approval required: amber attention treatment.
- Blocked/destructive: red danger treatment.
- Unavailable/inactive: muted gray treatment.
- Informational: blue treatment.

## Motion Principles

Motion should explain system state. It should not exist as decoration.

Core motion model:

```txt
Separate -> Align -> Evaluate -> Settle
```

Rules:

- Use motion to clarify progress, not to distract.
- Avoid continuous full-logo loops.
- Respect reduced-motion preferences.
- Use the full Council Core identity motion sparingly.
- Use smaller state transitions for routine activity.
- Keep timing calm and operational.

Recommended motion tone:

```txt
precise, quiet, directional, deliberate
```

Avoid:

```txt
sparkly, magical, frantic, bouncy, cute
```

## UI Symbolism

Use product symbols consistently:

| Symbol | Meaning |
| --- | --- |
| Council Core | Coordination, synthesis, governed decision. |
| Agent node | Specialist participation. |
| Arc/path | Routing, workflow, or relationship. |
| Check circle | Verified phase or completed validation. |
| Pause/lock | Approval required. |
| Ledger line | Recorded action, decision, or audit entry. |
| Evidence card | Source-backed context. |
| Warning badge | Risk, uncertainty, or policy attention. |

## Agent And System-State Language

Use active but non-theatrical labels:

| State | Preferred language |
| --- | --- |
| Loading context | Reading context |
| Choosing agents | Coordinating agents |
| Agent work | Reviewing, testing, checking, synthesizing |
| Approval gate | Approval required |
| Dry run | Planning only |
| Execution | Executing approved action |
| Validation | Verifying result |
| Failure | Blocked or validation failed |
| Memory update | Remembered decision |

Avoid labels like:

- Awakening intelligence
- Thinking magic
- Agent swarm
- Autonomous action
- Infinite reasoning

## Accessibility And Trust Rules

- Never rely on color alone for status.
- Pair status colors with labels and icons.
- Keep semantic danger distinct from brand violet/blue/cyan.
- Make disabled and unavailable states explicit.
- Do not animate critical warnings in a way that reduces readability.
- Keep approval and execution states auditable.
- Provide exact command, action, or file references when applicable.

## Implementation Boundary

This document defines product-brand behavior. It should not become a token file or component API.

The implementation layer belongs in:

```txt
docs/brand/brand-implementation.md
```

That future document should define design tokens, CSS variables, component mappings, animation timings, icon specifications, Figma variables, and React usage.

## Open Questions

- Should the Council Core become a reusable icon for runtime, approvals, evaluations, and memory?
- Which semantic color values should be adopted for success, warning, danger, information, and disabled states?
- Should proof-loop artifacts appear in the main conversation stream, a side panel, or both?
- How should project memory updates be shown without making the UI feel noisy?
- Which motion states should ship first in the web console?

## Working Verdict

The logo brief is mature enough to begin vector exploration. This product brand system is the missing companion layer that keeps interface behavior, language, trust states, motion, and evidence patterns coherent.
