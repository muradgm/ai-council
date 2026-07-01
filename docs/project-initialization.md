# Project Initialization

Create new projects with:

```bash
pnpm council project:init ProjectName "short description"
```

This creates:

- `projects/<project>/README.md`
- `projects/<project>/PROJECT.md`
- `projects/<project>/project.ai.config.ts`
- `storage/memory/projects/<Project>/project-context.md`
- decision/session/task memory folders

## After Initialization

Run:

```bash
pnpm council project:doctor ProjectName
pnpm council context ProjectName "define MVP and technical plan"
```

Then use the generated context pack with Codex.
