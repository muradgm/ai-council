# AI Council Skills Package

Phase 2 adds the reusable capability layer of AI Council.

A skill is a modular capability folder with:

- `SKILL.md` — human/agent-readable operating guide
- `skill.json` — machine-readable manifest
- `workflows/` — repeatable procedures
- `templates/` — reusable output structures
- `checklists/` — quality gates
- `examples/` — known-good examples
- `prompts/` — invocation prompts
- `references/` — curated notes and sources

## Current count

68 skills.

## How agents should use skills

1. Read `packages/orchestrator/bootstrap.md`.
2. Select the smallest useful set of skills from `skills.index.json`.
3. Load each selected `SKILL.md`.
4. Run the skill workflow.
5. Validate with the checklist.
6. Save important decisions in docs or project memory.

## Rule

Do not duplicate knowledge inside senior agents. Agents should point to skills, not copy their content.
