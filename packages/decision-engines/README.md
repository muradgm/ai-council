
# Decision Engines

Decision engines are reusable reasoning systems used by the AI Council when a task requires judgment, tradeoff analysis, risk review, or a formal recommendation.

They are deliberately separated from both `skills` and `senior-agents`:

```text
Senior Agent → selects Decision Engine → loads Skills → produces artifact
```

## Included engines

This package currently includes **37** engines across engineering, design, product, business, finance, AI, governance, and operations.

See:

- `registry.md`
- `index.json`

## Engine structure

Each engine follows the same structure:

```text
engine-name/
├── ENGINE.md
├── engine.json
├── README.md
├── workflow.md
├── rubric.md
├── workflows/
│   └── standard.workflow.md
├── rubrics/
│   └── scoring-rubric.md
├── checklists/
│   ├── preflight.checklist.md
│   └── quality-gate.checklist.md
├── templates/
│   └── decision-memo.template.md
├── prompts/
│   └── invoke.prompt.md
├── examples/
│   └── example-decision.md
└── references/
    └── README.md
```

## How to use with Codex

```text
Read packages/orchestrator/bootstrap.md.
Then, for this task, route to the right decision engine under packages/decision-engines.
Load only the required engine, agents, and skills.
Return a decision memo before implementation if the decision affects architecture, product direction, financial/trading risk, security, or brand strategy.
```

## CLI commands

```bash
pnpm engines:list
pnpm engines:route "review the architecture for my trading app"
pnpm engines:run "should we use PostgreSQL or MongoDB for SignalScout?"
```

## Rule

Decision engines do not replace expertise. They standardize reasoning so the Council does not make shallow, inconsistent, or overconfident decisions.
