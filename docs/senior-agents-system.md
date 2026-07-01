# Senior Agents System

Senior agents are the expert-role layer of AI Council.

## Why this exists

Skills contain reusable knowledge. Senior agents decide how to apply that knowledge from a professional role perspective.

Example:

- `branding` is a skill.
- `senior-brand-designer` is an agent.
- `branding-engine` is a decision engine.

Keeping these separate prevents knowledge duplication.

## Agent contract

Every agent must have:

- `AGENT.md`
- `agent.json`
- `instructions.md`
- `workflow.md`
- `skill-map.md`
- `checklists/agent-quality.checklist.md`
- `templates/agent-brief.template.md`
- `prompts/invoke.prompt.md`
- `handoffs/standard-handoff.md`

## Routing

Use `packages/senior-agents/agents.index.json` or run:

```bash
pnpm agents:list
pnpm agents:route "build a React dashboard with backend auth"
```

## Council groups

### Executive

Strategy, priority, finance, operations, AI governance, product direction.

### Startup

Entrepreneurship, validation, business model, market research, venture building.

### Product and design

Product management, UX, UI, branding, design systems, motion.

### Engineering

Architecture, full-stack, frontend, backend, AI engineering, DevOps, security, QA.

### Marketing and sales

Growth, SEO, copywriting, sales, negotiation, communication.

### Finance and trading

Forex, quantitative research, risk management, portfolio thinking, financial analysis, macro.

### Research and operations

Research, documentation, project management, operations, legal risk spotting.

## Important boundary

Finance/trading agents are for structured analysis, education, journaling, and risk review. They must not promise profits or generate guaranteed signals.
