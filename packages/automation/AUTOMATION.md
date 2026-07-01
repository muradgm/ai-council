# Automation Operating Model

The AI Council automation layer converts plans into controlled execution artifacts.

## Core loop

1. Capture task or opportunity.
2. Normalize the work into a task record.
3. Route it to a project, agents, skills, workflows, and decision engines.
4. Add it to backlog or queue.
5. Generate a Codex task prompt when implementation is needed.
6. Track execution status.
7. Run release readiness checks before shipping.
8. Update documentation, memory, decisions, and observability records.

## What this layer should produce

- A clear task record.
- A useful priority and risk classification.
- A next-action recommendation.
- A Codex prompt that can be pasted into a coding agent.
- A checklist that prevents careless execution.
- A report showing what is pending, active, blocked, and done.

## What this layer must not do by default

- Send emails.
- Create paid cloud resources.
- Deploy to production.
- Place trades or financial orders.
- Delete data.
- Modify secrets.
- Bypass tests, evals, or quality gates.
