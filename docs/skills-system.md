# Skills System

The skills package is the reusable capability layer of AI Council.

## Design goals

- Modular: each skill can be loaded independently.
- Discoverable: each skill has a `skill.json` manifest.
- Agent-friendly: each skill has a `SKILL.md` with operating rules.
- Quality-focused: every skill includes a checklist.
- Reusable: templates and workflows are stored next to the skill.

## Skill folder contract

```text
skill-name/
├── SKILL.md
├── skill.json
├── README.md
├── workflows/
├── templates/
├── checklists/
├── examples/
├── prompts/
└── references/
```

## Selection rule

The orchestrator should load the fewest skills required to solve the task. Loading too many skills creates noise.

## Dependency rule

If a skill declares dependencies in `skill.json`, the orchestrator may load them when they materially improve the task.

## Trading and finance boundary

Trading and investing skills are for education, research structure, journaling, and risk review. They must not generate guaranteed-profit claims or encourage high-risk behavior.
