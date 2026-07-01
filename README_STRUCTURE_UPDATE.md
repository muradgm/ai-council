# AI Council Structure Update

This repository has been extended with three major reusable layers:

```text
packages/
├── skills/
├── senior-agents/
└── decision-engines/
```

## How to Validate

```bash
pnpm install
pnpm validate:knowledge
```

## How to Use

1. Pick a project from `projects/`.
2. Pick a senior agent from `packages/senior-agents/`.
3. Let the agent load relevant skills from `packages/skills/`.
4. Use a decision engine from `packages/decision-engines/` for structured judgment.
5. Produce deliverables using templates and checklists.

## Important Separation

- Projects contain product-specific material.
- Skills contain reusable capability knowledge.
- Senior agents contain role behavior.
- Decision engines contain repeatable reasoning methods.
