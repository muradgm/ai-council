# Governed Action Runtime

AI Council now has a governed action runtime with dry-run planning and a narrow approved execution slice.

The goal is to turn a user request into a reviewable action plan before any file write, command, install, publish, provider call, or destructive operation is allowed.

## Command

```bash
pnpm council act ai-council "create model-backed agent hardening plan" --dry-run
```

Approved execution is intentionally narrow:

```bash
pnpm council act ai-council "create model-backed agent hardening plan" --execute --approve act-02
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

## What approved execution can do

Approved execution currently supports only:

- creating non-source Markdown review artifacts under `storage/governance/action-plans/`, `storage/governance/reports/`, or `docs/`,
- updating non-source Markdown files under those same safe roots,
- running commands from the explicit validation allowlist.

Before updating an existing file, the runtime writes a backup under:

```text
storage/governance/action-backups/
```

Approved execution still skips source edits, package installs, deletes, deploys, publishing, provider calls, secrets, and arbitrary shell commands.

## Current governance defaults

| Action | Default |
|---|---|
| Create review artifact | allowed with logging |
| Run allowlisted validation command | allowed with logging |
| Edit source code | approval required |
| Install package | approval required |
| Publish, deploy, or push | approval required |
| Delete file | approval required |
| Touch secrets or `.env` | blocked |
| Destructive shell command | blocked |

## Validation command allowlist

Only these validation commands can execute through the action runtime:

```text
pnpm test
pnpm build
pnpm lint
pnpm validate:knowledge
pnpm final:validate
pnpm gates:run
```

## Why this matters

This is the first step from intelligent answers toward safe action-capable autonomy. The runtime does not apply source patches, install dependencies, delete files, deploy, publish, or run arbitrary commands. It makes the proposed work explicit, auditable, and testable before allowing small approved actions.

Future slices should add approval records, rollback execution, approved source patching, and validation-driven rollback.
