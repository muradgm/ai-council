# Data Model: SignalScout

## Initial Entities

This is a planning-level model. Refine during implementation.

```text
User
ProjectSettings
CoreItem
Review
DecisionRecord
Task
Artifact
```

## Data Modeling Rules

- Start with the smallest model that supports the MVP.
- Make user-created data exportable where practical.
- Avoid storing provider responses without purpose.
- Track source, timestamp, and confidence for AI-generated content.
- Keep audit-related records append-only when possible.

## Open Questions

- Which entities are needed for the first usable workflow?
- What should be local-only vs cloud-stored?
- What data needs versioning?
- What data is sensitive or regulated?
