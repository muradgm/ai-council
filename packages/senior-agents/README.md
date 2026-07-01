# AI Council Senior Agents Package

Phase 3 adds the expert roster layer of AI Council.

A senior agent is a role-specific reasoning wrapper that knows:

- what it is responsible for,
- which skills it should load,
- how it should execute work,
- when it should hand off to another expert,
- what quality bar it must meet.

## Current count

47 senior agents.

## Folder contract

```text
agent-name/
├── AGENT.md
├── agent.json
├── instructions.md
├── workflow.md
├── skill-map.md
├── checklists/
├── templates/
├── examples/
├── prompts/
└── handoffs/
```

## Rule

Agents do not duplicate domain knowledge. They reference `packages/skills` and apply those skills to a task.
