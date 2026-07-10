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

## Route decision order

AI Council routes requests in this order:

1. Explicit `@agent` mention selects the lead agent.
2. Deterministic task rules infer task type, council, support agents, required context, and risk flags.
3. Project hints and request risk level refine the deterministic route.
4. Model fallback may be added later, but it must return strict JSON matching the routing schema.

The route decision shape is:

```ts
type CouncilRouteDecision = {
  taskType: "repo_review" | "security_review" | "architecture_review" | "ui_review" | "runtime_review" | "docs_review" | "feature_build" | "bug_fix" | "product_strategy" | "general";
  councilId: string;
  leadAgent: string;
  supportAgents: string[];
  confidence: "high" | "medium" | "low";
  reason: string;
  requiredContext: string[];
  riskFlags: string[];
  source: "mention" | "deterministic" | "schema-fallback";
};
```

The model fallback parser is schema-ready, but runtime routing remains deterministic until eval coverage proves that a model classifier improves routing quality.
