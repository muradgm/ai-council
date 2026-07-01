# Permission Check

## Purpose

Classify whether a requested Council action is allowed, restricted, approval-gated, or disallowed.

## Risk level

`medium`

## Approval required

`false`

## Standard process

1. Capture the request.
2. Classify data, action, environment, and reversibility.
3. Apply the relevant governance policy.
4. Decide: allow, approve, deny, or escalate.
5. Write an audit record when the decision is material.

## Output

Return a concise governance decision with risk level, reasoning, and next action.
