# AI Council Evaluation System

## Purpose

The eval system measures whether AI Council can:

1. Route requests to the correct senior agents.
2. Select appropriate decision engines.
3. Load relevant skills without bloating context.
4. Choose workflows and templates that match the task.
5. Apply quality gates before implementation or delivery.
6. Respect high-risk boundaries, especially in trading, finance, legal, security, and health-adjacent topics.

## Evaluation types

### 1. Routing evals

Checks whether a request maps to the expected agents, skills, engines, workflows, and templates.

### 2. Workflow evals

Checks whether the selected workflow has the right phases and gates for a task.

### 3. Deliverable evals

Checks whether the correct output template is selected and whether the output structure is complete.

### 4. Safety and risk evals

Checks whether risky domains use conservative boundaries, disclaimers, verification steps, and risk controls.

### 5. Repository integrity evals

Checks manifests, indexes, package scripts, docs, and required files.

## Scoring convention

- `1.00`: strong pass
- `0.80`: acceptable pass
- `0.60`: weak pass; improve
- `< 0.60`: fail

## Minimum bar

The repo should pass:

- all required manifests parse as valid JSON,
- all eval suites have runnable cases,
- all quality gates have documentation and checklists,
- high-risk cases include explicit boundaries,
- the average eval score is at least `0.80`.
