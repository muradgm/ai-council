# Prompt Evaluation Workflow

    ## Purpose

    Evaluate prompts and agent instructions against accuracy, consistency, safety, format, and task success.

    ## When to use

    Use this workflow when the user request includes one or more of these signals:

    - prompt
- instruction
- evaluate prompt
- system prompt
- GPT instructions

    ## Operating principle

    This workflow is not a prompt shortcut. It is an execution protocol. The Council must route the request, load the minimum required expertise, perform the work, and produce verifiable deliverables.

    ## Required senior agents

    - `chief-ai-officer`
- `research-lead`
- `technical-writer`

    ## Required skills

    - `prompt-engineering`
- `evals`
- `core-reasoning`
- `documentation`

    ## Decision engines

    - `llm-prompt-evaluation-engine`
- `ai-safety-engine`

    ## Standard phases

    1. **Intake** — clarify the task, project, constraints, and success criteria.
    2. **Routing** — select agents, skills, and engines.
    3. **Analysis** — inspect available context and separate facts from assumptions.
    4. **Plan** — create a compact execution plan with validation steps.
    5. **Execute** — implement, write, design, review, or research as requested.
    6. **Review** — apply quality gates, update docs, and produce final notes.

    ## Expected outputs

    - Prompt scorecard
- Failure cases
- Revised prompt
- Eval checklist

    ## Quality gates

    - The selected agents match the actual work, not the user's wording only.
    - The selected skills and engines exist in the repository.
    - Important assumptions are stated before execution.
    - Risk, security, finance, and trading boundaries are respected.
    - Validation commands or review criteria are included whenever the output changes the repo.
    - Documentation is updated when the workflow creates durable project knowledge.

    ## Safety and boundaries

    Follow project safety, privacy, security, and user-confirmation boundaries.
