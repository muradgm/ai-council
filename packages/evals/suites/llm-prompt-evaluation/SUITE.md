# LLM Prompt Evaluation Suite

## Purpose

This suite checks whether AI Council can handle `ai` requests with the right routing, risk awareness, and deliverable structure.

## Expected route

- Agents: chief-ai-officer, senior-ai-engineer
- Engines: llm-prompt-evaluation-engine, ai-agent-design-engine
- Workflows: prompt-evaluation, ai-agent-build
- Skills: prompt-engineering, evals, agent-design
- Templates: prompt-evaluation-report

## Pass threshold

`0.8` average score.

## Review rule

If this suite fails, improve the smallest responsible layer: manifest keywords, router logic, workflow definition, or the eval case itself.
