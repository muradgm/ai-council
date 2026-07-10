# Action Ledger

AI Council records governed action decisions as append-only JSON Lines.

Default path:

```txt
storage/governance/action-ledger/actions.jsonl
```

Each line has this shape:

```ts
type ActionLedgerEntry = {
  id: string;
  runId: string;
  planId: string;
  actionId: string;
  actionKind: string;
  target?: string;
  decision: "allowed" | "approval_required" | "blocked";
  approvalId?: string;
  executed: boolean;
  validationStatus?: "passed" | "failed" | "skipped";
  rollbackStatus?: "not_needed" | "available" | "executed" | "failed";
  createdAt: string;
};
```

Dry-run plans may write ledger entries, but they must record `executed: false` and `validationStatus: "skipped"`.

Execution entries must include whether validation passed, failed, or was skipped. If rollback is possible through a backup or known rollback strategy, `rollbackStatus` should be `available`.
