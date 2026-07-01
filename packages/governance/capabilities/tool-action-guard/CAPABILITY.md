# Tool Action Guard

## Purpose

Gate tool execution by impact, reversibility, data sensitivity, and user approval.

## Risk level

`high`

## Approval required

`true`

## Standard process

1. Capture the request.
2. Classify data, action, environment, and reversibility.
3. Apply the relevant governance policy.
4. Decide: allow, approve, deny, or escalate.
5. Write an audit record when the decision is material.

## Output

Return a concise governance decision with risk level, reasoning, and next action.
