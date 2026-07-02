# 07 Evaluation Strategy

Reusable AI Core + Project Config + Domain Agents + Tool Permissions + Memory Scope + Evaluation Suite + Learning Loop.

Production behavior must change only through evaluated, versioned, reviewable releases.

## Behavior gates

AI Council validation should test runtime behavior, not only catalog shape.

The model-backed agent gate checks that a Council answer:

- contains structured findings,
- exposes uncertainty,
- records structured finding counts in evidence,
- avoids old scaffold or placeholder agent language.

This gate is included in `pnpm test` and `pnpm final:validate`. It is intentionally small but important: it protects the first real-intelligence hardening slice from regressing back into generic, label-only orchestration.

Future eval expansion should add golden project-review cases for architecture, security, QA, and synthesis, then score whether the agents cite concrete source evidence and produce actionably different recommendations for different repositories.
