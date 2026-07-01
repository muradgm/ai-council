# AI Council Workflows

This package contains the **workflow orchestration layer** for AI Council.

A workflow is an end-to-end execution protocol. It tells the Council how to move from a user request to a finished deliverable by selecting agents, skills, decision engines, phases, templates, and quality gates.

## Current coverage

- Workflows: **33**
- Skills referenced: **58**
- Senior agents referenced: **41**
- Decision engines referenced: **36**

## Anatomy of a workflow

```text
workflow-name/
├── WORKFLOW.md
├── workflow.json
├── README.md
├── phases/
├── templates/
├── checklists/
├── prompts/
├── examples/
├── handoffs/
└── references/
```

## How the orchestrator should use workflows

1. Classify the user request.
2. Route to the best matching workflow.
3. Load the workflow manifest.
4. Load required agents, skills, and decision engines.
5. Execute the phases in order.
6. Run quality gates.
7. Produce final deliverables and update docs.

## Commands

```bash
pnpm workflows:list
pnpm workflows:route "build a trading journal feature"
pnpm workflows:run "feature-planning"
```
