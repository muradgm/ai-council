# Memory Specification

## Required memory record types

AI Council uses Markdown for human-readable memory and JSON metadata for routing and validation.

### Project context

Required fields:

- Project name
- Purpose
- Product wedge
- Current stage
- Users
- Constraints
- Architecture notes
- Current priorities
- Open questions
- Related skills, agents, engines, workflows, and templates

### Session summary

Required fields:

- Date
- Project
- User goal
- Work completed
- Files changed
- Decisions made
- Blockers
- Next actions

### Decision record

Required fields:

- Date
- Project
- Decision
- Status
- Context
- Options considered
- Rationale
- Consequences
- Review date

### Task state

Required fields:

- Task title
- Project
- Status
- Acceptance criteria
- Current plan
- Blockers
- Owner agents
- Relevant skills
- Relevant engines

### Context pack

Required fields:

- Active project
- Current task
- Non-negotiable instructions
- Loaded context
- Suggested agents
- Suggested skills
- Suggested engines
- Suggested workflow
- Output expectations

## Freshness

Memory older than the current project documentation must be treated as advisory. If the same fact appears in both memory and committed docs, the committed docs win unless the user explicitly says otherwise.
