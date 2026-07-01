# Architecture: NAVO / Flowday

## Architecture Direction

Use a modular, simple architecture until the core product behavior is proven.

Recommended default:

```text
UI / Web App
  -> API layer
  -> Domain services
  -> Data store
  -> AI/provider adapter when needed
  -> Observability + memory updates
```

## Early Architecture Rules

- Keep domain logic outside UI components.
- Keep provider calls behind adapters.
- Store important decisions as records, not scattered notes.
- Make generated outputs reviewable.
- Prefer deterministic rules for core recommendations before adding AI complexity.

## Council Integration

Use:

- `architecture-engine` for structural decisions.
- `data-model-engine` for schema choices.
- `security-review-engine` for risky features.
- `release-readiness-engine` before shipping.
