# Logging Policy

## Goal

Log enough to reproduce decisions and failures without storing unnecessary private content.

## Required fields

Every log-like record should include timestamp, run id when available, command or workflow name, summary, status, and validation result.

## Prohibited fields

Do not log raw API keys, passwords, private tokens, session cookies, bank data, or unredacted personal data.
