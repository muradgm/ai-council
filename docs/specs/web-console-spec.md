# Web Console Specification

## Component

`apps/web-console`

## API dependency

`apps/api-server`

## Required endpoints

| Endpoint | Method | Purpose |
|---|---:|---|
| `/health` | GET | API readiness |
| `/api/summary` | GET | System counts and health |
| `/api/catalog/:collection` | GET | Catalog records by collection |
| `/api/route` | POST | Council routing for a user task |
| `/api/projects` | GET | Project and memory status |
| `/api/observability` | GET | Trace, artifact, cost, provider-call, and diagnostic summaries |

## Required collections

- skills
- agents
- engines
- workflows
- templates
- evalSuites
- providers
- toolContracts
- projects

## Non-goals for Phase 12

- remote deployment
- authentication
- direct model calls from the browser
- file editing from the browser
- destructive actions
- paid-provider execution

## Acceptance criteria

1. `pnpm dev:api` starts the local API.
2. `pnpm dev:web` starts the Vite app.
3. The console loads counts from the API.
4. Catalog navigation works.
5. Task routing works.
6. Console status script works.
7. Console snapshot script writes to `storage/web-console/snapshots`.
8. `pnpm validate:knowledge` passes.
