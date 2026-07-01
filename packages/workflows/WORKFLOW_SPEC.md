# Workflow Specification

## Required files

Every workflow folder must contain:

- `WORKFLOW.md`
- `workflow.json`
- `README.md`
- `phases/01-intake.md`
- `phases/02-routing.md`
- `phases/03-analysis.md`
- `phases/04-plan.md`
- `phases/05-execute.md`
- `phases/06-review.md`
- `templates/workflow-brief.template.md`
- `templates/final-report.template.md`
- `checklists/preflight.checklist.md`
- `checklists/quality-gate.checklist.md`
- `prompts/invoke.prompt.md`
- `examples/example-run.md`
- `handoffs/standard-handoff.md`
- `references/README.md`

## Manifest shape

```json
{
  "name": "feature-planning",
  "title": "Feature Planning Workflow",
  "version": "1.0.0",
  "entrypoint": "WORKFLOW.md",
  "category": "product-engineering",
  "description": "...",
  "triggers": ["feature"],
  "agents": ["product-manager"],
  "skills": ["product-management"],
  "decisionEngines": ["product-strategy-engine"],
  "phases": ["01-intake"],
  "outputs": ["Feature spec"],
  "qualityGates": ["scope-is-clear"],
  "safety": "..."
}
```

## Design rules

- Workflows orchestrate; they do not duplicate skill knowledge.
- Workflows choose senior agents; they do not become personas themselves.
- Workflows invoke decision engines where tradeoffs matter.
- Workflows must produce verifiable outputs.
- Workflows must respect safety boundaries, especially for finance, trading, legal, security, and medical topics.
