# Example Risk Review Decision

## Reviewed decision

Should the project enable external provider calls for private repo context?

## Recommendation

Fix first: add redaction and explicit approval gate.

## Risk

Private code or secrets could be sent externally.

## Mitigation

Default to local provider and require approval for sanitized external routing.
