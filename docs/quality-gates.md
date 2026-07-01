# AI Council Quality Gates

Quality gates are deterministic checks that protect the Council from obvious failure modes.

## Gate categories

- Knowledge integrity
- Routing quality
- Documentation quality
- Safety boundaries
- Trading risk controls
- Security baseline
- Codex readiness
- Release readiness

## Minimum use

Run before merging structural changes:

```bash
pnpm gates:run
```

Run together with full validation:

```bash
pnpm validate:knowledge
pnpm evals:run
pnpm gates:run
```

## Gate interpretation

A passing gate does not mean the output is brilliant. It means the repo meets the minimum standard required for safe and repeatable Council operation.
