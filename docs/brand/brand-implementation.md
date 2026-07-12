---
template: brand-implementation
title: AI Council Brand Implementation
status: draft
version: 0.1
scope: design-tokens-component-motion-mapping
updated: 2026-07-12
---

# AI Council Brand Implementation

This document converts the approved brand direction into implementation rules for the web console and future product surfaces.

## Core Principle

AI Council should feel like a governed senior operating system for builders, not a generic chatbot. The UI should make the loop visible:

```txt
Context -> Coordinate -> Evaluate -> Approve -> Execute -> Verify -> Remember
```

## Color Tokens

### Brand Tokens

Use these for identity, Council Core motion, primary accents, and high-emphasis product moments.

```css
--brand-council-violet: #785CFF;
--brand-signal-blue: #4DA3FF;
--brand-synapse-cyan: #00D4C8;
```

### Neutral Tokens

Use these for product chrome, panels, borders, and readable interface text.

```css
--neutral-deep-space: #0B0F17;
--neutral-panel-navy: #121826;
--neutral-border-slate: #1A2130;
--neutral-mist-white: #E6EAF2;
--neutral-pure-white: #FFFFFF;
```

### Semantic Tokens

Semantic colors must stay separate from the logo and identity mark.

```css
--semantic-success: #22C55E;
--semantic-warning: #F59E0B;
--semantic-danger: #EF4444;
--semantic-info: #4DA3FF;
--semantic-disabled: #6F7A8C;
```

## Component Mapping

### Council Core Mark

The app mark is the product's active identity signal.

- Use three orbiting nodes for agent coordination.
- Use one center core for synthesis and final judgment.
- Use only Council Violet, Signal Blue, and Synapse Cyan.
- Do not add warm colors, rainbow gradients, or decorative specks to the core logo.
- Run a short activation motion on load.
- Do not loop the full identity animation continuously.

### Proof Loop Panel

The proof loop panel replaces generic "thinking" language. It should show the real work phases:

1. Context
2. Coordinate
3. Evaluate
4. Approve
5. Execute
6. Verify
7. Remember

Completed phases show a filled check state. The active phase shows a live ring. Pending phases stay quiet.

### Agent Cards

Agent cards should communicate role, status, and contribution quality.

- Progress bars fill to 100% when complete.
- Active cards use brand accents.
- Warnings use semantic warning.
- Blocked states use semantic danger.

### Event Trail

The event trail is evidence, not decoration.

- Use "verified" for completed events.
- Use "active" for current events.
- Use "queued" for pending events.
- Use "not needed" for skipped governance steps.
- Use "blocked" for failed or unsafe steps.

## Motion Rules

```css
--motion-standard: cubic-bezier(0.22, 1, 0.36, 1);
```

- Micro feedback: 120ms-220ms.
- Panel/menu transitions: 180ms-320ms.
- Proof loop phase transitions: 240ms-420ms.
- Council Core activation: 900ms-1200ms.

Respect `prefers-reduced-motion`. In reduced motion mode, show the final static state or a minimal fade.

## State Classes

Future UI should prefer explicit state classes over one-off color styling.

```txt
.council-core.is-dormant
.council-core.is-gathering
.council-core.is-coordinating
.council-core.is-evaluating
.council-core.is-approval-required
.council-core.is-executing
.council-core.is-verified
.council-core.is-blocked
.council-core.is-uncertain
```

## First Implementation Slice

The first web-console slice should:

1. Add brand tokens to CSS.
2. Replace generic "Thinking progress" labels with "Proof loop".
3. Show the seven Council loop phases.
4. Align the brand mark with the three-node Council Core model.
5. Keep all existing chat, routing, event, and runtime behavior unchanged.
6. Pass build, tests, and final validation.
