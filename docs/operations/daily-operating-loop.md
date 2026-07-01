# Daily Operating Loop

Use this loop when working on real products.

## 1. Choose one project

Do not ask the Council to improve everything. Pick one product.

```bash
pnpm project-packs:list
```

## 2. Generate context

```bash
pnpm council context TradeFrame "today's task"
```

## 3. Route the request

```bash
pnpm council route "today's task"
```

## 4. Create or pull the task

```bash
pnpm backlog:list TradeFrame
pnpm backlog:add TradeFrame "Task title" "Task description"
```

## 5. Ask for an execution plan

Use Codex with the generated context pack.

## 6. Execute and verify

Run relevant checks:

```bash
pnpm validate:knowledge
pnpm gates:run
pnpm evals:run
```

## 7. Record progress

```bash
pnpm trace:run TradeFrame "task" "summary"
pnpm memory:session TradeFrame "summary"
pnpm docs:update TradeFrame "change summary"
```

## 8. Stop expanding foundation

After v2.0.0, prioritize project work over adding more abstract layers.
