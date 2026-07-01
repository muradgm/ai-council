# Secrets Handling

Never copy secrets into prompts, docs, logs, or reports. Use placeholders such as `<REDACTED_API_KEY>`.

If a secret is found:

1. Stop propagation.
2. Redact display output.
3. Write a secrets-scan report.
4. Recommend rotation if exposure is plausible.
