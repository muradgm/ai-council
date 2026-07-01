# Decision Engine Specification

A decision engine is a structured reasoning process for repeatable judgment.

## Required Files

```text
packages/decision-engines/<engine-name>/
├── ENGINE.md
├── engine.json
├── rubric.md
├── workflow.md
├── checklists/
└── examples/
```

## Required Sections

- Decision purpose
- Inputs
- Constraints
- Scoring rubric
- Failure modes
- Escalation triggers
- Output format

## Rule

Use decision engines when the outcome affects architecture, security, money, product direction, brand strategy, or user trust.
