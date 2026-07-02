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
- data view with catalog coverage, runtime quality, provider readiness, observability records, and local transcript counts
- runtime context, runtime execution artifacts, and runtime artifact quality checks
- local AI Council conversations through the API orchestrator
- local folder imports for browser-side project review context
- file attachments in the composer for local-only prompt context

## Interface

The console uses a Codex-style working layout:

- left rail for navigation, projects, Council assets, and local status
- right workspace for the active conversation or tool surface
- Data workspace for system coverage, health, and lightweight charts
- bottom composer for project-scoped Council questions
- Context Stack on desktop for project memory, provider readiness, runtime context, selected agents, and task routing

## Conversation

The console includes a conversation panel for local-first questions. It calls the API server's `/ask` endpoint, shows the selected council, provider, and agents used, and keeps recent message history in local browser storage so sent messages remain visible after reload.

While a response is running, the UI shows a staged thinking path with an animated process indicator: route, read memory, ask model, and synthesize. This is a product state indicator, not hidden chain-of-thought.

Assistant answers are rendered as structured judgement sections: Read, Why it matters, Next move, and Risks. Raw Model synthesis, Evidence, and Trace details are available behind "View details" disclosures so the main answer stays readable.

The composer supports attachments. Readable text files are sampled in the browser and included as local-only prompt context; binary files are represented as metadata. Attachments are not uploaded to a cloud provider by the browser.

The Projects view can import a local folder through the browser folder picker. The console samples useful project files such as README, PROJECT, package/config, docs, and source files, stores that sampled context in local browser storage, and can route a Council review against it.

When a repository project is selected, the API includes a compact project/memory preview in the local orchestrator request so the answer can reflect real local context.

When the local model is unavailable, the API stays honest about provider status and returns a deterministic Council read instead of pretending a model produced the answer. The fallback answer should still sound like a senior technical partner: concrete judgement, caveats, next action, and trace metadata.

## Runtime Workbench

The console includes a local runtime workbench backed by the API server:

- Generate task-specific runtime context.
- Run the local Council execution loop.
- Score the latest runtime artifact.
- Inspect local provider health configuration.
- Preview the latest runtime report in the browser.

Runtime actions call known local scripts through the API server. They write local artifacts under `storage/runtime`, `storage/evals`, `storage/observability`, and `storage/memory`; they do not call cloud providers from the browser.

## Local model setup

The default local provider is Ollama:

```bash
winget install --id Ollama.Ollama -e
ollama pull llama3.1
```

The repo defaults to:

```text
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
```

## Design principle

The console should make the Council inspectable before it becomes automatable. The first job is to show what the system knows, how it routes tasks, and where evidence is stored.
