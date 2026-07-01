# Project Pack: Swimly

## Product Type

decision-first pool recommender.

## Product Wedge

A simple recommender that picks the best pool option based on purpose, district, price, and practical fit instead of overwhelming users with a long list.

## Current Stage

static-data MVP.

## Target Users

- Berlin swimmers
- families
- fitness swimmers
- budget-sensitive users
- people choosing between nearby pools

## Core Problem

Finding the right pool is usually a manual comparison of location, purpose, pricing, family fit, swimming lanes, opening hours, and personal preference.

## MVP Scope

- district input
- purpose input
- price filter
- deterministic scoring
- top recommendation
- two alternatives
- explainable ranking

## Council Routing

### Primary Agents

- `product-manager`
- `senior-frontend-engineer`
- `ux-researcher`
- `data-engineer`
- `qa-engineer`

### Required Skills

- `product-management`
- `frontend`
- `typescript`
- `ux-research`
- `analytics`
- `testing`

### Decision Engines

- `product-strategy-engine`
- `ui-review-engine`
- `data-model-engine`
- `testing-strategy-engine`

### Workflows

- `feature-planning`
- `build-execution`
- `ui-review`
- `release-readiness`

### Deliverable Templates

- `prd`
- `technical-design-doc`
- `qa-test-plan`
- `release-readiness-report`

## Non-Negotiable Constraints

- Keep deterministic ranking explainable.
- Make data freshness visible.
- Avoid turning the MVP into a full booking platform.
- Keep the first version mobile-first and low-friction.

## Phase 13 Usage

Use this pack to load product context before planning, coding, reviewing, or creating deliverables for Swimly.

Recommended command:

```bash
pnpm project-pack:context swimly "describe the task here"
```
