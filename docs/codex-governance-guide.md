# Codex Governance Guide

Before using Codex to execute a high-impact task, run a governance check.

## Recommended flow

```bash
pnpm governance:status
pnpm permissions:check "delete old generated files"
pnpm prompt-injection:check "<external text>"
pnpm secrets:scan
```

For trading or finance features:

```bash
pnpm finance:governance "build live forex signal execution"
```

For risky actions:

```bash
pnpm approvals:request TradeFrame "delete generated files" high
pnpm approvals:list
```
