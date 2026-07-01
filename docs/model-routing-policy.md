# Model Routing Policy

## Local-first default

Use local models for:

- private repository review;
- early brainstorming;
- low-risk refactors;
- drafts that do not require expert-grade reasoning;
- any task containing secrets, credentials, tokens, private customer data, or confidential business data.

## Premium escalation

Escalate to premium models when:

- architecture decisions affect long-term maintainability;
- security, trading, finance, legal, or medical risk is involved;
- the task requires deep multi-step reasoning;
- the local model produces low confidence output;
- evals or quality gates fail.

## Freemium middle layer

Use freemium providers when:

- task complexity is moderate;
- cost matters;
- local output is weak but premium is not required;
- the task is public or sanitized.
