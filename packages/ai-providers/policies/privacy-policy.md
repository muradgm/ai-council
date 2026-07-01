# Provider Privacy Policy

## Privacy levels

- `local-only`: never send externally.
- `sanitized-cloud`: external provider allowed only after removing secrets, private identifiers, credentials, and sensitive source context.
- `cloud-ok`: external provider allowed.

## Redaction rules

Always redact:

- API keys;
- OAuth tokens;
- passwords;
- private SSH keys;
- customer personal data;
- unreleased proprietary code unless user approved sharing it with a cloud provider.
