# Final Release Checklist

## Repository

- [ ] `pnpm install` completes.
- [ ] `pnpm validate:knowledge` passes.
- [ ] `pnpm final:validate` passes.
- [ ] `pnpm council status` prints expected counts.
- [ ] `pnpm release:status` prints v2.0.0.

## Documentation

- [ ] Root `README.md` explains the system.
- [ ] `docs/codex-master-startup.md` is present.
- [ ] `docs/commands/command-reference.md` is present.
- [ ] `docs/architecture/system-overview.md` is present.
- [ ] `docs/release/v2.0.0-release-notes.md` is present.

## Runtime

- [ ] Project packs exist.
- [ ] Memory runtime exists.
- [ ] Governance runtime exists.
- [ ] Observability runtime exists.
- [ ] Web console files exist.

## Safety

- [ ] Governance doctor passes.
- [ ] Tool boundaries are documented.
- [ ] Trading/finance boundaries are documented.
- [ ] Prompt-injection checks are available.
- [ ] Secrets scan is available.

## Project execution

- [ ] Generate a context pack for one project.
- [ ] Route one project task.
- [ ] Produce one Codex task prompt.
- [ ] Record one run trace.
- [ ] Update one project memory/session note.
