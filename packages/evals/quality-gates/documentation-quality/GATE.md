# Documentation Quality Gate

## Purpose

Checks core docs exist and are useful.

## When to run

Run this gate before merging structural changes and after generating new Council phases.

## Pass criteria

- Required files exist.
- Related manifests are valid.
- Relevant scripts can execute without crashing.
- The gate produces a clear report.

## Failure response

Fix the smallest responsible layer. Do not lower the gate threshold just to make the report green.
