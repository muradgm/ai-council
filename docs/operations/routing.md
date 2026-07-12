# Routing Operations

## Deterministic agent mentions

Use `@agent` mentions when the user wants a specific lead specialist.

The mention selects the lead agent only. AI Council still owns context loading, support-agent routing, governance, validation, and final synthesis.

| Mention | Lead agent |
| --- | --- |
| `@stl` | `software-architect` |
| `@sec` | `security-architect` |
| `@qa` | `qa-engineer` |
| `@ai` | `ai-engineer` |
| `@ux` | `ux-strategist` |
| `@prod` | `product-strategist` |
| `@be` | `backend-engineer` |
| `@fe` | `frontend-engineer` |
| `@devops` | `devops-engineer` |

Control mentions:

| Mention | Behavior |
| --- | --- |
| `@help` | Shows mention help without model routing. |
| `@agents` | Lists available deterministic mentions without model routing. |

Unknown mentions are ignored and returned as warnings. They should not trigger model-based routing.
