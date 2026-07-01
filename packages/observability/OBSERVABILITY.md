# AI Council Observability System

## Purpose

The observability system answers six operational questions:

1. What did the Council do?
2. Which agents, skills, engines, workflows, tools, and providers were involved?
3. What artifacts were produced?
4. What was verified?
5. What cost, risk, or uncertainty was introduced?
6. What should the next session know?

## Operating model

Every meaningful run should produce at least one **run trace**. High-risk runs should also produce provider-call traces, artifact records, diagnostics reports, and decision records.

## Trace levels

| Level | Use when | Stored content |
|---|---|---|
| `minimal` | Low-risk routing or listing commands | command, timestamp, summary |
| `standard` | Normal repo work | route, selected components, outputs, checks |
| `detailed` | Architecture, trading, finance, security, release work | full structured evidence, risks, validations |
| `incident` | failures, data risk, broken builds, unsafe output | detailed failure chain and corrective action |

## Redaction rules

Never store raw secrets, API keys, passwords, private personal data, or full provider prompts by default. Use hashes, summaries, or explicit redaction markers.

## Relationship to memory

Memory stores project knowledge and state. Observability stores runtime evidence. A useful session summary may be copied into memory, but raw logs should remain in observability storage.
