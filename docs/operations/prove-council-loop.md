# Prove the Council Loop

Run the local proof script:

```bash
pnpm e2e:proof
```

The proof uses this prompt:

```txt
@stl review the governance package for security gaps.
```

It verifies:

- `@stl` resolves to `software-architect`.
- The deterministic router infers a security review.
- Governance and action-runtime context files are selected.
- The orchestrator returns response events.
- The final answer includes findings, risks, next move, and evidence.
- A governed dry-run action plan is created.
- Dry-run execution performs no writes or commands.
- Governance marks actions as allowed/logged or approval-required.

The script writes the latest human-readable proof to:

```txt
storage/runtime/proofs/latest-e2e-proof.md
```

The persistent action ledger is a separate milestone and should be added after this proof script.
