# Quick Start

## 1. Install

```bash
pnpm install
```

## 2. Validate the repo

```bash
pnpm validate:knowledge
pnpm final:validate
pnpm council doctor
```

## 3. Check status

```bash
pnpm council status
pnpm release:status
```

## 4. Choose a project

Current project packs:

- TradeFrame
- SignalScout
- NAVO / Flowday
- Swimly

Generate a project-specific context pack:

```bash
pnpm council context TradeFrame "build the trading journal MVP"
```

## 5. Ask the Council to route work

```bash
pnpm council route "build an AI trading journal feature"
```

## 6. Run work through a safe loop

```text
Context → route → plan → governance → execute → validate → trace → update docs/memory
```

## 7. Start the web console

```bash
pnpm dev:api
pnpm dev:web
```

Open `http://localhost:5173`.
