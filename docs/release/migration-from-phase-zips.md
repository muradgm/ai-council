# Migration From Earlier Phase ZIPs

Use the latest ZIP only:

```text
ai-council-v2-phase-16-final-integration-docs-release-layer.zip
```

Earlier phase ZIPs are historical snapshots. Do not manually merge them together.

## If you already unzipped an earlier phase

1. Back up any local edits.
2. Unzip Phase 16 into a clean folder.
3. Copy only your real project code or notes into the new repo.
4. Run validation.

```bash
pnpm install
pnpm validate:knowledge
pnpm final:validate
```

## If you modified project packs

Move changes into:

```text
packages/project-packs/<project>/
projects/<project>/
storage/memory/projects/<project>/
```

Then run:

```bash
pnpm project-pack:status
pnpm project:doctor <project>
```
