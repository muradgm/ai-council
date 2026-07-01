# GitHub Issue Generation

## Purpose

GitHub Issue Generation helps AI Council convert a request into controlled, trackable execution.

## When to use

Use this capability when the user request includes: github, issue, ticket.

## Inputs

- project
- task

## Outputs

- issue draft

## Risk level

`medium`

## Approval rule

Approval required: `true`

## Operating notes

- Preserve project context.
- Keep outputs concrete and actionable.
- Do not perform destructive or external actions automatically.
- Produce files in `storage/automation/` unless instructed otherwise.
