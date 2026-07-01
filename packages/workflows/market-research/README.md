# Market Research Workflow

This folder contains the executable Council workflow for **market-research**.

## Files

- `workflow.json` — machine-readable manifest.
- `WORKFLOW.md` — human-readable operating protocol.
- `phases/` — detailed phase instructions.
- `templates/` — reusable output formats.
- `checklists/` — workflow-specific quality gates.
- `prompts/` — invocation prompts for Codex or another coding agent.
- `examples/` — sample output.
- `handoffs/` — how to pass work to another agent or workflow.

## Default command

```bash
pnpm workflows:run "market-research"
```
