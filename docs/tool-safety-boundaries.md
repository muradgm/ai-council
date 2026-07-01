# Safe Execution Boundaries

## Green zone

- Read files in the repo.
- Generate new docs and reports.
- Run validation scripts.
- Run tests.
- Create local artifacts.

## Yellow zone

- Install dependencies.
- Modify source code.
- Create commits.
- Query local databases.
- Use cloud model providers with sanitized context.

## Red zone

- Delete data.
- Rotate or expose secrets.
- Send emails.
- Modify production systems.
- Place trades or interact with brokers.
- Share private code with external providers without approval.
