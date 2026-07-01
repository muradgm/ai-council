# Data Classification Policy

| Class | Description | Handling |
|---|---|---|
| Public | safe to publish | may use cloud providers |
| Internal | project docs, architecture, non-secret code | use caution; local preferred for large context |
| Confidential | strategy, private user docs, financial records | local-first; approval before cloud |
| Restricted | secrets, credentials, legal/health/financial sensitive data | do not expose; redact; approval required |

When unsure, classify higher.
