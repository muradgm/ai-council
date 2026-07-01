# Codex Deliverables Guide

Use this guide when starting a Codex session that must produce a concrete output.

## Startup prompt

```text
Read AGENTS.md and packages/orchestrator/bootstrap.md.
Then route this task through the AI Council.
Before generating the final answer, choose the correct deliverable template from packages/templates.
If no exact template exists, use the closest template and state why.
```

## Good Codex task prompt

```text
Use AI Council to create a technical design doc for the SignalScout outreach worker.
Read the project context, route to the correct agents, use the architecture and API design engines, then generate the deliverable using packages/templates/deliverables/technical-design-doc/TEMPLATE.md.
```

## Required behavior

- Search the repo before creating new files.
- Use existing templates.
- Write generated outputs to `storage/deliverables/` when asked to save artifacts.
- Update docs when the deliverable changes architecture, workflow, or standards.
```
