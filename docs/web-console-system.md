# Web Console System

Phase 16 includes a local dashboard and runtime workbench for AI Council v2.

The console does not replace the CLI. It makes the Council easier to inspect, route, execute locally, score, and debug visually.

## Primary goals

1. Browse the Council catalog.
2. Understand which agents, skills, engines, workflows, and templates exist.
3. Route natural-language tasks and inspect the selected Council components.
4. View project and memory readiness.
5. View data coverage, observability, traces, artifacts, diagnostics, provider readiness, and transcript counts.
6. Ask local-first Council questions through the API orchestrator.
7. Generate runtime context and runtime execution artifacts.
8. Score runtime artifacts with the same quality gate used by final validation.
9. Support Codex sessions with better context visibility.
10. Attach local files and import local folders as browser-side context for review.

## Architecture

```text
apps/web-console
        │
        ▼
apps/api-server
        │
        ▼
repository packages + storage
```

The browser does not read the filesystem directly. The local API server reads the repository and returns JSON.

## Runtime

```bash
pnpm dev:api
pnpm dev:web
pnpm apps:setup
```

Default URLs:

```text
API:  http://localhost:3333
Web:  http://localhost:5173
```

LAN/mobile URLs:

```bash
pnpm dev:api:lan
pnpm dev:web:lan
```

Open `http://<computer-lan-ip>:5173` from a phone or tablet on the same network. When the page is loaded from a non-localhost host, it uses `http://<same-host>:3333` as the API base by default. Use `?apiBase=http://<computer-lan-ip>:3333` to override and persist a different API base in browser storage.

## Console panels

| Panel | Purpose |
|---|---|
| Chat | Ask AI Council questions through the local API orchestrator |
| Data | Inspect catalog coverage, runtime artifact quality, provider readiness, observability signals, and local transcript counts |
| Knowledge | Browse agents, skills, engines, workflows, templates, evals, providers, tools, and projects |
| Router | Route a task through the Council |
| Projects | Inspect product folders and project memory |
| Observability | Inspect traces, costs, artifacts, diagnostics, and reports |
| Providers | Inspect local, freemium, and premium provider definitions |
| Evals | Inspect test suites and quality gates |
| Runtime | Generate runtime context, run the local Council loop, score artifacts, inspect provider health, and preview latest reports |
| Artifacts | Inspect generated outputs registered by observability |

## Interaction model

The web console is organized like a working AI coding app rather than a marketing dashboard:

- The left rail owns navigation, project selection, catalog shortcuts, and local health.
- The main workspace owns the conversation, composer, Data dashboard, runtime workbench, projects, or Knowledge view.
- The desktop chat view includes a right Context Stack for project memory, provider readiness, runtime context, selected agents, and quick routing.
- Mobile collapses the rail into compact navigation so the conversation remains reachable early.

Conversation responses should prioritize human judgement over raw routing output. The API still returns selected council/provider/agent metadata, but the visible answer is rendered as structured sections such as Read, Why it matters, Findings, Next move, Risks, and Uncertainty. Raw Model synthesis, Evidence, and Trace sections stay behind "View details" disclosures.

The thinking indicator shows product-level execution state with motion: route, read memory, ask model, and synthesize. It should never expose hidden chain-of-thought; it only communicates that the local Council is doing staged work.

When a project is selected, the API enriches `/ask` requests with compact local project and memory previews before calling the orchestrator. This keeps answers more context-aware while preserving the local-first boundary.

When a local folder is imported from the Projects view, the browser samples useful readable files and stores the resulting context in local browser storage. The API server does not receive arbitrary filesystem access from the browser. Attachments use the same local-only model: readable files are sampled into prompt context, while binary files are shown as metadata.

Recent conversation messages are stored in the local browser only. This makes sent messages inspectable after reload without introducing account storage, cloud sync, or repository writes.

## Safety model

The console is local-first and constrained.

The console can:

- read catalog metadata,
- show routes,
- display project status,
- display observability records,
- display Data dashboard signals,
- answer local-first conversation requests through `/ask`,
- attach selected local files as browser-side prompt context,
- import selected local folders as browser-side project context,
- run known local runtime scripts through the local API server,
- write local runtime, eval, observability, and memory artifacts.

The console should not yet:

- edit files,
- send emails,
- call paid providers,
- run arbitrary shell commands from browser input,
- execute destructive actions.

Runtime buttons call fixed scripts such as `runtime-context.mjs`, `runtime-run.mjs`, `runtime-eval.mjs`, and `provider-health.mjs` with project/task arguments. High-impact actions still belong behind automation and governance approvals.

## Extension path

Future upgrades can add:

- authentication for remote use,
- protected write actions,
- richer live workflow execution,
- artifact diffing and report history,
- model-cost dashboards,
- trace timelines,
- GitHub issue creation,
- task board integration.
