# AI Agent Build Workflow

    ## Purpose

    Design and implement AI agents with role boundaries, tools, memory, evals, safety limits, and handoffs.

    ## When to use

    Use this workflow when the user request includes one or more of these signals:

    - AI agent
- agent
- orchestrator
- tools
- memory

    ## Operating principle

    This workflow is not a prompt shortcut. It is an execution protocol. The Council must route the request, load the minimum required expertise, perform the work, and produce verifiable deliverables.

    ## Required senior agents

    - `chief-ai-officer`
- `ai-engineer`
- `principal-software-architect`

    ## Required skills

    - `ai-engineering`
- `agent-design`
- `prompt-engineering`
- `evals`
- `rag`

    ## Decision engines

    - `ai-agent-design-engine`
- `ai-safety-engine`
- `llm-prompt-evaluation-engine`

    ## Standard phases

    1. **Intake** — clarify the task, project, constraints, and success criteria.
    2. **Routing** — select agents, skills, and engines.
    3. **Analysis** — inspect available context and separate facts from assumptions.
    4. **Plan** — create a compact execution plan with validation steps.
    5. **Execute** — implement, write, design, review, or research as requested.
    6. **Review** — apply quality gates, update docs, and produce final notes.

    ## Expected outputs

    - Agent spec
- Tool boundaries
- Memory policy
- Eval plan

    ## Quality gates

    - The selected agents match the actual work, not the user's wording only.
    - The selected skills and engines exist in the repository.
    - Important assumptions are stated before execution.
    - Risk, security, finance, and trading boundaries are respected.
    - Validation commands or review criteria are included whenever the output changes the repo.
    - Documentation is updated when the workflow creates durable project knowledge.

    ## Safety and boundaries

    Follow project safety, privacy, security, and user-confirmation boundaries.
