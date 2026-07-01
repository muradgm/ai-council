# Automation Reporting

## Purpose

Automation Reporting helps AI Council convert a request into controlled, trackable execution.

## When to use

Use this capability when the user request includes: report, status, summary.

## Inputs

- project optional

## Outputs

- automation report

## Risk level

`low`

## Approval rule

Approval required: `false`

## Operating notes

- Preserve project context.
- Keep outputs concrete and actionable.
- Do not perform destructive or external actions automatically.
- Produce files in `storage/automation/` unless instructed otherwise.
