# Orchestrator Design

The orchestrator is the coordination layer of AI Council.

It decides:

- which senior agents should be involved
- which skills are required
- which decision engines should be used
- which project context matters
- which deliverable format is appropriate

## Routing Logic

| Request Type | Primary Agent | Decision Engine | Typical Skills |
|---|---|---|---|
| Build feature | CTO / Architect | Architecture Engine | React, Backend, Database |
| Review UI | Senior Designer | UI Review Engine | UI Design, UX, Accessibility |
| Startup strategy | Entrepreneur | Startup Evaluation Engine | Business Model, Product, Marketing |
| Forex system | Forex Trader + Risk Manager | Trading Risk Engine | Forex, Risk Management, Quant Analysis |
| Security review | Security Engineer | Security Review Engine | Security, Architecture, Backend |

## Escalation Rules

Escalate to multiple agents when:

- money is at risk
- user trust is at risk
- architecture changes are involved
- external security exposure exists
- trading or investment decisions are requested
- legal or compliance implications may exist
