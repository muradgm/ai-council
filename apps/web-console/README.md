# AI Council Web Console

The Web Console is the local visual dashboard for AI Council v2.

It is intentionally lightweight:

- Vite + TypeScript
- no React dependency yet
- local API server at `http://localhost:3333`
- read-first behavior by default
- no cloud provider calls from the browser

## Run

```bash
pnpm install
pnpm dev:api
pnpm dev:web
pnpm apps:setup
```

Open:

```text
http://localhost:5173
```

## Mobile / LAN access

On a phone or tablet connected to the same Wi-Fi network, start the local services in LAN mode:

```bash
pnpm dev:api:lan
pnpm dev:web:lan
```

Then open:

```text
http://<your-computer-ip>:5173
```

The console automatically points API calls to `http://<your-computer-ip>:3333`. You can also override the API URL once with:

```text
http://<your-computer-ip>:5173/?apiBase=http://<your-computer-ip>:3333
```

## What it shows

- senior agents
- skills
- decision engines
- workflows
- deliverable templates
- eval suites
- provider definitions
- tool contracts
- projects
- observability records
- runtime context, runtime execution artifacts, and runtime artifact quality checks
- local AI Council conversations through the API orchestrator

## Conversation

The console includes a conversation panel for local-first questions. It calls the API server's `/ask` endpoint, shows the selected council, provider, and agents used, and keeps message history in browser memory for the current session.

## Runtime Workbench

The console includes a local runtime workbench backed by the API server:

- Generate task-specific runtime context.
- Run the local Council execution loop.
- Score the latest runtime artifact.
- Inspect local provider health configuration.
- Preview the latest runtime report in the browser.

Runtime actions call known local scripts through the API server. They write local artifacts under `storage/runtime`, `storage/evals`, `storage/observability`, and `storage/memory`; they do not call cloud providers from the browser.

## Design principle

The console should make the Council inspectable before it becomes automatable. The first job is to show what the system knows, how it routes tasks, and where evidence is stored.
