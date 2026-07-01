# Phase 11 — Storage, Observability + Trace Layer

## Added

- `packages/observability/`
- structured trace schemas
- observability policies
- runtime storage directories
- run trace scripts
- provider trace scripts
- cost and artifact tracking
- diagnostics report generation
- observability report generation
- expanded Council CLI commands
- expanded validation

## Design decision

Observability is separate from memory. Memory stores durable project context. Observability stores runtime evidence.
