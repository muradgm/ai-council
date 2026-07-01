# Gmail Tool Contract

## Purpose

Read or write email only after explicit user intent.

## Allowed by default

- Read-only inspection inside the approved project scope.
- Generating summaries, plans, or diagnostics.
- Reporting uncertainty and missing permissions.

## Requires approval

- Write actions.
- Destructive actions.
- External network transfer.
- Access to private personal or business data.
- Cost-incurring execution.

## Forbidden

- Secret exposure.
- Silent destructive changes.
- Production modification without explicit user authorization.
- Any live financial execution.

## Logging

Record the purpose, scope, commands or operations, changed files, and outcome.
