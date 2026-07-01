# Automation + Task Execution Package

This package turns AI Council planning into trackable work.

It does **not** execute risky actions automatically. It produces structured tasks, sprint plans, release checklists, GitHub issue drafts, Codex task prompts, and documentation update plans.

## Main responsibilities

- Maintain project backlog records.
- Create prioritized sprint plans.
- Manage a lightweight local task queue.
- Generate GitHub issue drafts from Council context.
- Generate Codex-ready implementation prompts.
- Generate release readiness checklists.
- Generate documentation update plans.
- Produce automation reports for project status and execution hygiene.

## Runtime storage

Runtime records live under:

```text
storage/automation/
├── backlog/
├── queue/
├── sprints/
├── releases/
├── github-issues/
├── codex-tasks/
├── docs-updates/
└── reports/
```

## Safety boundary

Automation in this phase is **coordination**, not autonomous deployment. Any destructive file operation, external send, production deployment, trading action, or money-related execution requires explicit human approval.
