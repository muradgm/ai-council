# Tool Permissions Policy

Tool use must respect least privilege.

## Default tool posture

- Read-only actions are usually allowed.
- Write actions require clear scope.
- External write actions require approval.
- Destructive actions require approval plus rollback plan.
- Secret-bearing actions are restricted.

Tool contracts remain the authoritative source for tool-specific boundaries.
