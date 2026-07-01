# Skill Specification

A skill is a reusable expert capability. Skills are not personas. They are knowledge modules used by senior agents and decision engines.

## Required Files

```text
packages/skills/<skill-name>/
├── SKILL.md
├── skill.json
├── README.md
├── workflows/
├── templates/
├── checklists/
├── examples/
└── references/
```

## `SKILL.md` Required Sections

```md
# Skill Name

## Purpose
## When To Use
## Inputs
## Outputs
## Core Principles
## Workflow
## Quality Bar
## Common Failure Modes
## Safety / Risk Notes
## Checklist
```

## Manifest Fields

```json
{
  "name": "skill-name",
  "version": "1.0.0",
  "category": "engineering",
  "owner": "principal-software-architect",
  "dependencies": [],
  "tags": []
}
```

## Rules

- One skill, one capability.
- Do not mix role identity into skills.
- Do not put project-specific details in skills.
- If a skill affects money, legal exposure, safety, security, or health, include explicit risk boundaries.
