
# Example: Startup Evaluation Engine Output Skeleton

## Decision Question

Should the project use Option A or Option B for this decision?

## Recommendation

Recommended option: Option A  
Confidence: Medium

## Why

Option A better satisfies the most important constraints while keeping the decision reversible.

## Tradeoffs

- Gains: faster implementation, clearer ownership.
- Costs: less flexibility in edge cases.
- Unknowns: needs validation under real usage.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Incorrect assumption | Medium | High | Run a small validation task first |

## Next Actions

1. Validate the strongest assumption.
2. Implement the smallest safe version.
3. Document the decision in the relevant project docs.
