# Storage, Observability + Trace System

Phase 11 adds a repository-native evidence layer for AI Council.

## Why this exists

Without traces, a complex agent system becomes hard to trust. You need to know what was routed, what was executed, what changed, what was verified, and what remains risky.

## New package

```text
packages/observability/
```

This package defines trace records, provider-call records, cost records, artifact records, diagnostics reports, and incident reports.

## New storage

```text
storage/observability/
```

This stores runtime evidence for Council sessions.

## Practical use

```bash
pnpm observability:init
pnpm observability:status
pnpm trace:run "TradeFrame" "build trading journal MVP" "Created plan and updated docs"
pnpm trace:provider openai "architecture review" premium 0.12
pnpm trace:artifact docs/report.md document "Architecture report"
pnpm trace:cost provider 0.12 EUR "Premium reasoning for architecture review"
pnpm diagnostics:report
pnpm observability:report
```
