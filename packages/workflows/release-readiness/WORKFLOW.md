# Release Readiness Workflow

    ## Purpose

    Check whether a feature, app, or system is safe to release against quality, security, docs, and rollback criteria.

    ## When to use

    Use this workflow when the user request includes one or more of these signals:

    - release
- deploy
- launch
- go live
- ship

    ## Operating principle

    This workflow is not a prompt shortcut. It is an execution protocol. The Council must route the request, load the minimum required expertise, perform the work, and produce verifiable deliverables.

    ## Required senior agents

    - `project-manager`
- `qa-engineer`
- `devops-engineer`
- `cybersecurity-engineer`

    ## Required skills

    - `testing`
- `devops`
- `security`
- `documentation`
- `operations`

    ## Decision engines

    - `release-readiness-engine`
- `security-review-engine`
- `testing-strategy-engine`
- `devops-engine`

    ## Standard phases

    1. **Intake** — clarify the task, project, constraints, and success criteria.
    2. **Routing** — select agents, skills, and engines.
    3. **Analysis** — inspect available context and separate facts from assumptions.
    4. **Plan** — create a compact execution plan with validation steps.
    5. **Execute** — implement, write, design, review, or research as requested.
    6. **Review** — apply quality gates, update docs, and produce final notes.

    ## Expected outputs

    - Release checklist
- Go/no-go decision
- Rollback plan
- Known risks

    ## Quality gates

    - The selected agents match the actual work, not the user's wording only.
    - The selected skills and engines exist in the repository.
    - Important assumptions are stated before execution.
    - Risk, security, finance, and trading boundaries are respected.
    - Validation commands or review criteria are included whenever the output changes the repo.
    - Documentation is updated when the workflow creates durable project knowledge.

    ## Safety and boundaries

    Follow project safety, privacy, security, and user-confirmation boundaries.
