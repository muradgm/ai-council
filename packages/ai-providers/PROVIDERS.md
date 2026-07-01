# Provider System

The provider system answers four questions before any model is used:

1. **Can this task leave the local machine?**
2. **How risky is the task?**
3. **What quality level is required?**
4. **What is the cheapest provider that still meets the required quality?**

## Routing priority

```text
Privacy constraint
  -> safety/risk constraint
  -> reasoning/coding capability
  -> context length need
  -> cost policy
  -> fallback policy
```

## Human approval triggers

A provider route should require explicit user approval when:

- private code, credentials, personal files, or client data would be sent to a cloud model;
- an action could cost money beyond the configured limit;
- the task concerns trading, legal, medical, security, or other high-stakes domains;
- the selected provider differs from the project policy.

## Execution state

Provider adapters in this repo are safe placeholders. Real HTTP calls must be added behind explicit environment checks and safe logging.
