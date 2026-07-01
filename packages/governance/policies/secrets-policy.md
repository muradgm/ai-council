# Secrets Policy

Secrets must never be committed, printed in reports, pasted into prompts, or sent to external providers.

## Potential secrets

- API keys
- OAuth tokens
- Private keys
- Passwords
- Session cookies
- Database URLs with credentials
- Broker credentials
- Cloud provider credentials

When a possible secret is detected, redact it and write a local scan report.
