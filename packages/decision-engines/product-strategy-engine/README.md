
# Product Strategy Engine

Reusable decision engine for **product strategy decision**.

## Files

- `ENGINE.md` — primary operating instructions.
- `engine.json` — machine-readable manifest.
- `workflows/standard.workflow.md` — step-by-step execution flow.
- `rubrics/scoring-rubric.md` — scoring guide.
- `checklists/preflight.checklist.md` — before running the engine.
- `checklists/quality-gate.checklist.md` — before accepting the decision.
- `templates/decision-memo.template.md` — reusable output format.
- `prompts/invoke.prompt.md` — prompt for Codex/LLM use.
- `examples/example-decision.md` — example structure.

## Usage

```bash
pnpm engines:run "product decision for my project"
```
