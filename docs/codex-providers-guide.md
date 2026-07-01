# Codex Provider Guide

When using Codex with AI Council:

1. Start with `pnpm council bootstrap <project> "<task>"`.
2. Use `pnpm providers:route "<task>"` to inspect provider fit.
3. Use local providers for private code by default.
4. Escalate to premium providers for high-risk architecture, security, or trading decisions.
5. Use `pnpm tools:check` before any workflow involving shell, Git, email, calendar, Drive, or external APIs.

Codex should never silently send private repo context to a cloud provider. The context must be sanitized or explicitly approved.
