# Integrations: SignalScout

## Integration Strategy

Do not start with integrations unless they are necessary for the wedge.

## Candidate Integration Types

- AI providers through `packages/ai-providers/`
- Tool contracts through `packages/tool-contracts/`
- Export formats through deliverable templates
- Project memory through `packages/memory/`
- Observability through `packages/observability/`

## Integration Rules

- Use adapters instead of direct provider calls.
- Add human approval for external writes, messages, or irreversible actions.
- Log provider usage and cost when cloud models are used.
- Keep secrets out of committed files.
