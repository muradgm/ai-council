# Context Priority Policy

Load context in this order:

1. Current user instruction.
2. Project source files and committed docs.
3. Project context memory.
4. Accepted decision records.
5. Recent session summaries.
6. Active task state.
7. Skills, agents, engines, workflows, and templates.
8. Examples and references.

When token budget is limited, drop examples first and preserve constraints, decisions, and acceptance criteria.
