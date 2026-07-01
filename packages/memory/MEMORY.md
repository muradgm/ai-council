# AI Council Memory System

## Operating principle

Memory should make the next session better without making it less truthful.

Every memory record must be:

- explicit,
- inspectable,
- editable,
- attributable to a project or session,
- safe to ignore when stale.

## Memory levels

### Level 1 — Current instruction

The user's latest request has the highest priority.

### Level 2 — Repository truth

Source files, tests, project docs, package manifests, and committed architecture documents are stronger than memory.

### Level 3 — Project memory

Project memory captures durable goals, constraints, decisions, and current priorities.

### Level 4 — Session memory

Session memory captures work performed during a specific interaction.

### Level 5 — Examples and patterns

Examples help but must not be treated as requirements.

## Update rule

If memory and code disagree, inspect the code and update memory rather than forcing code to match stale notes.
