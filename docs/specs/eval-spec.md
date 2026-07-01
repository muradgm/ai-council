# Eval Suite Specification

Every eval suite lives in:

```text
packages/evals/suites/<suite-name>/
```

Required files:

```text
SUITE.md
suite.json
rubric.md
checklist.md
cases/*.json
golden/*.md
```

## `suite.json`

```json
{
  "name": "architecture-review",
  "title": "Architecture Review Eval Suite",
  "category": "engineering",
  "entrypoint": "SUITE.md",
  "threshold": 0.8,
  "keywords": ["architecture", "system design"],
  "expectedAgents": ["principal-software-architect"],
  "expectedEngines": ["architecture-engine"],
  "expectedWorkflows": ["architecture-review"],
  "expectedSkills": ["software-architecture"],
  "expectedTemplates": ["architecture-decision-record"]
}
```

## Case file

Each case file contains a natural-language request and expected routing targets.

```json
{
  "id": "architecture-review-001",
  "request": "review the architecture for an AI trading app",
  "expected": {
    "agents": ["principal-software-architect"],
    "engines": ["architecture-engine"],
    "workflows": ["architecture-review"],
    "skills": ["software-architecture"],
    "templates": ["architecture-decision-record"]
  },
  "riskLevel": "medium"
}
```

## Score rule

The deterministic runner gives credit when expected targets appear in the top routed results. Future model-based evals can use the same case files and compare generated outputs against rubrics and golden examples.
