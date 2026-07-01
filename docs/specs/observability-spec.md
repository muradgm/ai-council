# Observability Specification

## Record types

- Run trace
- Trace event
- Provider call trace
- Cost record
- Artifact record
- Diagnostic report
- Incident report

## Required behavior

1. Store structured JSON for machine use.
2. Store optional Markdown reports for human review.
3. Redact secrets by default.
4. Link records by `runId` when possible.
5. Keep artifacts and diagnostics discoverable from CLI commands.
