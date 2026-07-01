# Skills, Senior Agents, and Decision Engines

AI Council now separates reusable expertise into three layers.

## 1. Skills
Skills are modular capabilities stored under `packages/skills`. Each skill has a `SKILL.md` file and supporting folders for workflows, templates, checklists, examples, prompts, and references.

## 2. Senior Agents
Senior agents are expert personas stored under `packages/senior-agents`. They do not own knowledge directly. They select and combine skills.

## 3. Decision Engines
Decision engines are reusable reasoning systems stored under `packages/decision-engines`. They standardize recurring decisions.

## Why This Matters
This keeps AI Council scalable:

- Skills are reusable.
- Agents remain lightweight.
- Decision logic becomes consistent.
- Projects can consume the same knowledge without duplication.

## Example Flow
```text
User request
  ↓
Orchestrator selects senior agent
  ↓
Senior agent selects skills
  ↓
Decision engine structures reasoning
  ↓
Workflow produces deliverable
  ↓
Checklist verifies quality
```
