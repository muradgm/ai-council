# AI Council Tool Contracts

Every tool integration must answer:

1. What can this tool do?
2. What is allowed by default?
3. What requires approval?
4. What is forbidden?
5. What must be logged?
6. What is the rollback or recovery plan?

## Default safety rule

Read-only actions are preferred. Write actions require explicit user intent or a project automation policy.

## Forbidden by default

- Exfiltrating secrets.
- Deleting user data without explicit confirmation.
- Sending emails or calendar invitations without explicit instruction.
- Running destructive shell commands.
- Performing live trading or financial execution.
- Silently uploading private repositories to cloud providers.
