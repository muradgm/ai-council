# Templates + Deliverables System

Phase 6 adds a structured output layer to AI Council.

The goal is simple: the Council should not only reason well; it should produce consistent, reusable, reviewable deliverables.

## Why this layer exists

Without templates, AI outputs drift. One session may produce a strong PRD, another may omit risks, and another may skip acceptance criteria. The templates layer prevents that by standardizing the shape of outputs.

## Core concepts

### Template

A reusable document structure, stored in:

```text
packages/templates/deliverables/<template-name>/TEMPLATE.md
```

### Manifest

A machine-readable file describing which skills, agents, engines, and workflows support the template.

```text
packages/templates/deliverables/<template-name>/template.json
```

### Deliverable

A generated output based on a template. Generated deliverables go to:

```text
storage/deliverables/
```

## Selection flow

```text
User request
  ↓
Route workflow
  ↓
Choose agents
  ↓
Choose skills
  ↓
Choose decision engines
  ↓
Choose template
  ↓
Generate deliverable
  ↓
Run checklist
```

## Commands

```bash
pnpm templates:list
pnpm templates:route "create a brand brief for Flowday"
pnpm deliverables:generate brand-brief "Flowday travel planner"
```

## Rule

Templates are not decoration. They are execution boundaries. If a workflow produces a PRD, architecture memo, audit report, trading journal, or startup validation report, it should use a template.
