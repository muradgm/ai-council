# Project Pack Specification

## Required files

```text
packages/project-packs/<project>/
├── PROJECT_PACK.md
├── project-pack.json
├── README.md
├── strategy/
├── architecture/
├── roadmap/
├── tasks/
├── risks/
├── decisions/
├── codex/
├── workflows/
├── evals/
├── memory/
├── deliverables/
└── references/
```

## Manifest fields

- `name`
- `title`
- `kind`
- `entrypoint`
- `projectRoot`
- `memoryRoot`
- `wedge`
- `stage`
- `agents`
- `skills`
- `decisionEngines`
- `workflows`
- `templates`
- `keywords`

## Quality rules

- A project pack must define a wedge.
- It must name project-specific risks.
- It must include a Codex startup prompt.
- It must link to project memory.
- It must list relevant agents, skills, engines, workflows, and templates.
