# Tool Approval Matrix

| Action | Default | Approval required |
|---|---:|---|
| Read repo files | Allowed | No |
| Write generated docs | Allowed | No, if inside repo |
| Modify app source | Conditional | Yes for large refactors |
| Run tests | Allowed | No |
| Install packages | Conditional | Yes when changing lockfile materially |
| Send email | Blocked | Always |
| Delete files | Blocked | Always |
| Use cloud AI with private repo | Blocked | Always |
| Execute trade | Blocked | Always forbidden |
