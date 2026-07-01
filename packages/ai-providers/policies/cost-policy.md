# Provider Cost Policy

Default behavior:

1. Use local provider where viable.
2. Use freemium/low-cost provider for medium tasks.
3. Use premium provider only when complexity, risk, or quality requires it.

A task should define a maximum cost when possible. If the task is open-ended, the orchestrator should split it into small calls instead of making one expensive call.
