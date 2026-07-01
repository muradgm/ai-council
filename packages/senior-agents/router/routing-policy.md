# Senior Agent Routing Policy

The orchestrator should choose a lead agent and optional supporting agents.

## Routing rules

1. Prefer one lead agent.
2. Add support agents only when the task crosses disciplines.
3. Load the lead agent first, then load mapped skills.
4. Do not load the whole council by default.
5. If risk is high, include a reviewer agent.

## Common council groups

- Product build: Product Manager + Principal Software Architect + Senior Full-Stack Engineer + QA Engineer.
- Brand/product UX: Senior Brand Designer + UX Designer + UI Designer + Design Systems Lead.
- AI feature: Chief AI Officer + Senior AI Engineer + Evals + Security Engineer.
- Startup strategy: CEO + Entrepreneur + Market Researcher + CFO.
- Trading research: Forex Trader + Risk Manager + Quantitative Researcher.

## Escalation

Escalate to the CEO agent when strategic priority is unclear. Escalate to Risk Manager when financial, legal, security, or operational downside is meaningful.
