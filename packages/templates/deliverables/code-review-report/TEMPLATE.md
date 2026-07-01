---
template: code-review-report
title: Code Review Report
category: engineering
owner: AI Council
status: draft
---

# Code Review Report

**Project:** `{{project}}`  
**Owner:** `{{owner}}`  
**Date:** `{{date}}`  
**Prepared by:** `{{agent_or_workflow}}`

## Purpose

Use this deliverable to produce a clear, reviewable code review report for `{{project}}`.

## Operating Rules

- State assumptions explicitly.
- Separate facts, reasoning, recommendations, and open questions.
- Prefer concrete acceptance criteria over vague intent.
- Include risks and quality gates.
- Do not invent external facts; cite sources where research is involved.

## Scope Reviewed

- `{{fill_scope_reviewed}}`

## Summary Verdict

- `{{fill_summary_verdict}}`

## Strengths

- `{{fill_strengths}}`

## Blocking Issues

- `{{fill_blocking_issues}}`

## Non Blocking Issues

- `{{fill_non_blocking_issues}}`

## Security Findings

- `{{fill_security_findings}}`

## Performance Findings

- `{{fill_performance_findings}}`

## Tests Needed

- `{{fill_tests_needed}}`

## Suggested Patch Plan

- `{{fill_suggested_patch_plan}}`


## Quality Gates

- [ ] The deliverable has a clear decision or next action.
- [ ] Assumptions are explicit.
- [ ] Risks are documented.
- [ ] Owners and follow-ups are clear.
- [ ] The output can be reviewed by another agent without missing context.
