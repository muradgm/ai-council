# Governance Package

The Governance package defines the operating boundaries for AI Council v2.

It answers four questions before the Council acts:

1. **Is this action allowed?**
2. **Does it require explicit human approval?**
3. **Which risks must be checked first?**
4. **What audit record must be written afterward?**

This package is intentionally separate from automation. Automation tells the Council how to execute work. Governance decides whether execution is safe, permitted, approval-gated, or blocked.

## Core rule

The Council may assist, analyze, draft, plan, and prepare. It must not silently execute high-impact actions such as deleting data, spending money, sending messages, publishing code, deploying systems, exposing secrets, or giving personalized financial advice.

## Main folders

- `policies/` — human-readable operating rules.
- `permissions/` — roles, actions, environments, and permission matrix.
- `approvals/` — approval workflow and approval request format.
- `security/` — prompt injection, secrets, privacy, and threat-model guidance.
- `finance-trading/` — trading and finance-specific boundaries.
- `capabilities/` — machine-readable governance capabilities.
- `templates/` — reusable approval, audit, review, and incident templates.
- `checklists/` — practical gates for risky work.
- `guards/` — restricted actions and refusal/escalation patterns.
