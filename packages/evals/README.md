# Evals + Quality Gates Package

This package gives AI Council a measurable quality layer.

It does not replace human review. It creates repeatable checks that help the Council detect weak routing, missing context, unsafe trading output, shallow deliverables, broken manifests, and workflow drift.

## What this package contains

- Eval suites for routing, workflow selection, domain reasoning, and deliverable selection.
- Golden examples that define the expected shape of strong Council output.
- Rubrics for scoring usefulness, correctness, risk control, and documentation quality.
- Quality gates that can run before merging changes or before asking Codex to implement major work.
- Scripts for listing, routing, running, and reporting evals.

## Recommended usage

```bash
pnpm evals:list
pnpm evals:route "review a forex trading journal feature"
pnpm evals:run
pnpm gates:run
pnpm evals:report
```

## Operating rule

A Council output is not good because it sounds expert. It is good only when it passes the relevant gates: clear routing, bounded claims, practical next actions, domain safety, and verifiable acceptance criteria.
