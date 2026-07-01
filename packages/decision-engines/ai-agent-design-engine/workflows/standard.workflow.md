
# AI Agent Design Engine Standard Workflow

## 1. Frame the decision

Write one sentence that defines the decision. If the decision cannot be stated clearly, stop and clarify the problem.

## 2. Load context

Collect:

- relevant project files,
- project constraints,
- existing decisions,
- known risks,
- linked skills,
- owner agents.

## 3. Identify options

Generate 2-4 realistic options. Include "do nothing" when it is a legitimate alternative.

## 4. Score options

Use `rubrics/scoring-rubric.md`. Do not average blindly. A single critical failure can invalidate an option.

## 5. Stress test

Ask:

- What assumption could be false?
- What breaks first?
- What is the cost of being wrong?
- Is the decision reversible?
- What evidence is missing?

## 6. Decide

Make one recommendation. Avoid weak "it depends" conclusions unless evidence is genuinely insufficient.

## 7. Produce artifacts

Create or update:

- decision memo,
- risk register,
- next-action checklist,
- affected documentation.

## 8. Handoff

Send a concise handoff to the responsible senior agent and any implementation workflow.
