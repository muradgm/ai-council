# Permission Model

## Roles

- **User**: final authority for high-impact actions.
- **Council Orchestrator**: routes and coordinates work; cannot approve its own risky actions.
- **Senior Agent**: proposes expert decisions; does not execute irreversible actions alone.
- **Automation Runner**: prepares task artifacts; execution is gated by approval policy.
- **Tool Adapter**: executes only within declared tool contracts and permission rules.

## Permission decision values

- `allow`: proceed.
- `allow_with_logging`: proceed and write audit record.
- `approval_required`: prepare request and wait for explicit user approval.
- `deny`: refuse or redirect.
- `escalate`: stop and require human review.
