# Senior Agent Specification

A senior agent is an expert role that applies skills, workflows, and decision engines to produce high-quality output.

## Required Files

```text
packages/senior-agents/<agent-name>/
├── agent.md
├── agent.json
├── instructions.md
├── workflow.md
├── checklists/
├── templates/
└── examples/
```

## Required Behavior

Every senior agent must define:

- role purpose
- responsibilities
- decision rights
- required skills
- collaboration rules
- quality standards
- refusal or escalation boundaries

## Agent vs Skill

- Agent = who is thinking.
- Skill = what capability is being used.
- Decision engine = how a complex decision is evaluated.
