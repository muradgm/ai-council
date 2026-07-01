# Codex Task Generation

## Purpose

Codex Task Generation helps AI Council convert a request into controlled, trackable execution.

## When to use

Use this capability when the user request includes: codex, implementation prompt, coding task.

## Inputs

- project
- task

## Outputs

- codex prompt

## Risk level

`medium`

## Approval rule

Approval required: `false`

## Operating notes

- Preserve project context.
- Keep outputs concrete and actionable.
- Do not perform destructive or external actions automatically.
- Produce files in `storage/automation/` unless instructed otherwise.
