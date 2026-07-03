# 02 Orchestration

Reusable AI Core + Project Config + Domain Agents + Tool Permissions + Memory Scope + Evaluation Suite + Learning Loop.

Production behavior must change only through evaluated, versioned, reviewable releases.

## Runtime flow

The orchestrator turns a user task into a local-first Council run:

1. Select a council and the relevant specialist agents.
2. Load compact project, memory, and bounded repository-review context supplied by the API or runtime scripts.
3. Execute each agent through the shared `AgentResult` contract.
4. Synthesize the agent outputs into a human-readable answer with evidence, findings, uncertainties, and next actions.
5. Keep raw trace and provider details available for inspection without making them the main answer.

For AI Council repo-review requests, the API adds a small known-file context pack with `Source:` labels. This is intentionally narrower than arbitrary filesystem search: it gives agents enough executable context to cite source files while keeping browser-originated requests inside a predictable local boundary.

## Model-backed specialists

The first model-backed agents are:

- `software-architect`
- `security-architect`
- `qa-engineer`
- `final-synthesizer`

Each model-backed specialist loads its local instruction file, asks the selected provider for strict JSON, and normalizes the response into:

- `summary`
- `findings`
- `risks`
- `uncertainties`
- `nextActions`
- `recommendations`
- `confidence`

Provider access remains governed by privacy level. Private repository context defaults to local-only routing. If no usable model output is available, the agent returns a deterministic evidence-based fallback so the UI and tests still receive structured behavior without pretending that a model completed the review.
