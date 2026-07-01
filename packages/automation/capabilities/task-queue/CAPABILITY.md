# Task Queue

## Purpose

Task Queue helps AI Council convert a request into controlled, trackable execution.

## When to use

Use this capability when the user request includes: queue, next task, active task, done.

## Inputs

- project
- task id

## Outputs

- queued task
- status

## Risk level

`medium`

## Approval rule

Approval required: `false`

## Operating notes

- Preserve project context.
- Keep outputs concrete and actionable.
- Do not perform destructive or external actions automatically.
- Produce files in `storage/automation/` unless instructed otherwise.
