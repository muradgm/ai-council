# Release Checklist Running

## Purpose

Release Checklist Running helps AI Council convert a request into controlled, trackable execution.

## When to use

Use this capability when the user request includes: release, ship, deploy, readiness.

## Inputs

- project
- scope

## Outputs

- release checklist

## Risk level

`medium`

## Approval rule

Approval required: `true`

## Operating notes

- Preserve project context.
- Keep outputs concrete and actionable.
- Do not perform destructive or external actions automatically.
- Produce files in `storage/automation/` unless instructed otherwise.
