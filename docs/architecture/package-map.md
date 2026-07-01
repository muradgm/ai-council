# Package Map

```text
packages/
├── ai-core/
├── ai-providers/
├── automation/
├── cli/
├── decision-engines/
├── evals/
├── governance/
├── language-adapters/
├── memory/
├── observability/
├── orchestrator/
├── project-packs/
├── project-runtime/
├── senior-agents/
├── shared/
├── skills/
├── templates/
├── tool-contracts/
└── workflows/
```

## Composition model

```text
Project Pack
    uses Project Memory
    uses Workflows
    asks Orchestrator to route
        to Senior Agents
        using Skills
        through Decision Engines
        producing Templates/Deliverables
        guarded by Governance
        measured by Evals/Gates
        traced by Observability
```

## Where to add new things

| Need | Location |
|---|---|
| New capability | `packages/skills/<skill>/` |
| New expert role | `packages/senior-agents/<agent>/` |
| New structured reasoning tool | `packages/decision-engines/<engine>/` |
| New process | `packages/workflows/<workflow>/` |
| New deliverable format | `packages/templates/deliverables/<template>/` |
| New project | `projects/<project>/` and `packages/project-packs/<project>/` |
| New safety rule | `packages/governance/` |
| New provider policy | `packages/ai-providers/` |
| New eval | `packages/evals/` |
