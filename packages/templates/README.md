# Templates + Deliverables Layer

The templates layer turns Council analysis into reusable, structured outputs.

It is intentionally separate from skills, agents, decision engines, and workflows:

- **Skills** contain domain knowledge.
- **Senior agents** apply expertise.
- **Decision engines** standardize judgment.
- **Workflows** coordinate execution.
- **Templates** produce consistent deliverables.

Use this layer whenever Codex, ChatGPT, or another coding agent needs to produce a concrete artifact such as a PRD, architecture decision record, code review report, brand brief, trading journal entry, or startup validation report.

## Commands

```bash
pnpm templates:list
pnpm templates:route "write a PRD for an AI trading journal"
pnpm deliverables:generate prd "AI trading journal"
```

Generated deliverables are written to:

```text
storage/deliverables/
```
