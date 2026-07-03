# Governed Action Runtime

AI Council now has a first dry-run action runtime.

The goal is to turn a user request into a reviewable action plan before any file write, command, install, publish, provider call, or destructive operation is allowed.

## Command

```bash
pnpm council act ai-council "create model-backed agent hardening plan" --dry-run
```

The command writes a JSON action report under:

```text
storage/governance/action-reports/
```

## What dry-run does

Dry-run mode:

- creates an action plan,
- classifies every action by risk,
- marks actions as allowed, approval-required, or blocked,
- attaches rollback guidance,
- writes an action report,
- executes no target file, command, package, provider, publish, or delete action.

## Current governance defaults

| Action | Default |
|---|---|
| Create review artifact | allowed with logging |
| Run validation command | allowed with logging |
| Edit source code | approval required |
| Install package | approval required |
| Publish, deploy, or push | approval required |
| Delete file | approval required |
| Touch secrets or `.env` | blocked |
| Destructive shell command | blocked |

## Why this matters

This is the first step from intelligent answers toward safe action-capable autonomy. The runtime does not yet apply patches or run arbitrary commands. It makes the proposed work explicit, auditable, and testable first.

Future slices should add approved execution for narrow file writes, backups, validation, and rollback.
