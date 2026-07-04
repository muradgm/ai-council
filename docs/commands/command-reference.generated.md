# Generated Command Reference

Generated from `package.json`.

| Command | Script |
|---|---|
| `pnpm agents:list` | `node scripts/list-agents.mjs` |
| `pnpm agents:route` | `node scripts/route-agent.mjs` |
| `pnpm approvals:list` | `node scripts/approvals-list.mjs` |
| `pnpm approvals:request` | `node scripts/approvals-request.mjs` |
| `pnpm apps:setup` | `node scripts/apps-setup.mjs` |
| `pnpm artifacts:list` | `node scripts/list-artifacts.mjs` |
| `pnpm audit:record` | `node scripts/audit-record.mjs` |
| `pnpm automation:init` | `node scripts/automation-init.mjs` |
| `pnpm automation:report` | `node scripts/automation-report.mjs` |
| `pnpm automation:status` | `node scripts/automation-status.mjs` |
| `pnpm backlog:add` | `node scripts/backlog-add.mjs` |
| `pnpm backlog:list` | `node scripts/backlog-list.mjs` |
| `pnpm build` | `tsc -p tsconfig.json` |
| `pnpm codex:context` | `node scripts/codex-context.mjs` |
| `pnpm codex:task` | `node scripts/codex-task-generate.mjs` |
| `pnpm console:open` | `node scripts/console-open.mjs` |
| `pnpm console:snapshot` | `node scripts/console-snapshot.mjs` |
| `pnpm console:status` | `node scripts/console-status.mjs` |
| `pnpm council` | `node scripts/council.mjs` |
| `pnpm council:act` | `node scripts/council-act.mjs` |
| `pnpm council:automation` | `node scripts/council.mjs automation:status` |
| `pnpm council:bootstrap` | `node scripts/codex-bootstrap.mjs` |
| `pnpm council:console` | `node scripts/council.mjs console` |
| `pnpm council:doctor` | `node scripts/council.mjs doctor` |
| `pnpm council:evals` | `node scripts/council.mjs evals:run` |
| `pnpm council:final` | `node scripts/council.mjs final:validate` |
| `pnpm council:gates` | `node scripts/council.mjs gates:run` |
| `pnpm council:governance` | `node scripts/council.mjs governance:status` |
| `pnpm council:health` | `node scripts/council-health.mjs` |
| `pnpm council:help` | `node scripts/council.mjs help` |
| `pnpm council:init` | `node scripts/council.mjs init` |
| `pnpm council:map` | `node scripts/generate-repo-map.mjs` |
| `pnpm council:observability` | `node scripts/council.mjs observability:status` |
| `pnpm council:plan` | `node scripts/council.mjs plan` |
| `pnpm council:project-packs` | `node scripts/council.mjs project-packs:list` |
| `pnpm council:providers` | `node scripts/council.mjs providers:list` |
| `pnpm council:release` | `node scripts/council.mjs release:status` |
| `pnpm council:route` | `node scripts/council-route.mjs` |
| `pnpm council:status` | `node scripts/council.mjs status` |
| `pnpm council:tools` | `node scripts/council.mjs tools:list` |
| `pnpm deliverables:generate` | `node scripts/generate-deliverable.mjs` |
| `pnpm dev` | `pnpm dev:cli` |
| `pnpm dev:api` | `tsx apps/api-server/src/main.ts` |
| `pnpm dev:api:lan` | `tsx apps/api-server/src/main.ts` |
| `pnpm dev:cli` | `tsx apps/cli/src/index.ts` |
| `pnpm dev:web` | `vite apps/web-console` |
| `pnpm dev:web:lan` | `vite apps/web-console --host 0.0.0.0 --port 5173` |
| `pnpm diagnostics:report` | `node scripts/diagnostics-report.mjs` |
| `pnpm docs:commands` | `node scripts/generate-command-reference.mjs` |
| `pnpm docs:repo-map` | `node scripts/generate-final-repo-map.mjs` |
| `pnpm docs:update` | `node scripts/docs-update-plan.mjs` |
| `pnpm engines:list` | `node scripts/list-engines.mjs` |
| `pnpm engines:route` | `node scripts/route-engine.mjs` |
| `pnpm engines:run` | `node scripts/run-engine.mjs` |
| `pnpm evals:list` | `node scripts/list-evals.mjs` |
| `pnpm evals:report` | `node scripts/eval-report.mjs` |
| `pnpm evals:route` | `node scripts/route-eval.mjs` |
| `pnpm evals:run` | `node scripts/run-evals.mjs` |
| `pnpm final:validate` | `node scripts/final-validation.mjs` |
| `pnpm finance:governance` | `node scripts/finance-governance-check.mjs` |
| `pnpm format` | `node scripts/format-check.mjs` |
| `pnpm gates:run` | `node scripts/run-quality-gates.mjs` |
| `pnpm github:issue` | `node scripts/github-issue-generate.mjs` |
| `pnpm governance:doctor` | `node scripts/governance-doctor.mjs` |
| `pnpm governance:init` | `node scripts/governance-init.mjs` |
| `pnpm governance:report` | `node scripts/governance-report.mjs` |
| `pnpm governance:status` | `node scripts/governance-status.mjs` |
| `pnpm learning:feedback` | `node scripts/learning-feedback.mjs` |
| `pnpm learning:report` | `node scripts/learning-report.mjs` |
| `pnpm lint` | `tsc -p tsconfig.json --noEmit` |
| `pnpm memory:context` | `node scripts/build-context-pack.mjs` |
| `pnpm memory:decision` | `node scripts/record-decision.mjs` |
| `pnpm memory:init` | `node scripts/memory-init.mjs` |
| `pnpm memory:session` | `node scripts/session-summary.mjs` |
| `pnpm memory:status` | `node scripts/memory-status.mjs` |
| `pnpm memory:task` | `node scripts/task-state.mjs` |
| `pnpm observability:init` | `node scripts/observability-init.mjs` |
| `pnpm observability:report` | `node scripts/observability-report.mjs` |
| `pnpm observability:status` | `node scripts/observability-status.mjs` |
| `pnpm permissions:check` | `node scripts/permissions-check.mjs` |
| `pnpm project-pack:context` | `node scripts/project-pack-context.mjs` |
| `pnpm project-pack:status` | `node scripts/project-pack-status.mjs` |
| `pnpm project-pack:sync` | `node scripts/sync-project-packs.mjs` |
| `pnpm project-packs:list` | `node scripts/list-project-packs.mjs` |
| `pnpm project-packs:route` | `node scripts/route-project-pack.mjs` |
| `pnpm project:context` | `node scripts/project-context.mjs` |
| `pnpm project:doctor` | `node scripts/project-doctor.mjs` |
| `pnpm project:init` | `node scripts/init-project.mjs` |
| `pnpm project:list` | `node scripts/list-projects.mjs` |
| `pnpm prompt-injection:check` | `node scripts/prompt-injection-check.mjs` |
| `pnpm providers:env` | `node scripts/generate-provider-env.mjs` |
| `pnpm providers:health` | `node scripts/provider-health.mjs` |
| `pnpm providers:list` | `node scripts/list-providers.mjs` |
| `pnpm providers:policy` | `node scripts/provider-policy.mjs` |
| `pnpm providers:route` | `node scripts/route-provider.mjs` |
| `pnpm providers:set-env` | `node scripts/provider-env-set.mjs` |
| `pnpm release:checklist` | `node scripts/release-checklist.mjs` |
| `pnpm release:notes` | `node scripts/release-notes.mjs` |
| `pnpm release:status` | `node scripts/release-status.mjs` |
| `pnpm repo:doctor` | `node scripts/council-doctor.mjs` |
| `pnpm repo:map` | `node scripts/generate-repo-map.mjs` |
| `pnpm runtime:context` | `node scripts/runtime-context.mjs` |
| `pnpm runtime:eval` | `node scripts/runtime-eval.mjs` |
| `pnpm runtime:index` | `node scripts/runtime-index.mjs` |
| `pnpm runtime:run` | `node scripts/runtime-run.mjs` |
| `pnpm secrets:scan` | `node scripts/secrets-scan.mjs` |
| `pnpm skills:list` | `node scripts/list-skills.mjs` |
| `pnpm sprint:plan` | `node scripts/sprint-plan.mjs` |
| `pnpm task:queue` | `node scripts/task-queue.mjs` |
| `pnpm templates:list` | `node scripts/list-templates.mjs` |
| `pnpm templates:route` | `node scripts/route-template.mjs` |
| `pnpm test` | `tsx tests/smoke.test.ts && tsx tests/model-backed-agents.test.ts && tsx tests/repo-review-context.test.ts && tsx tests/action-runtime.test.ts` |
| `pnpm tools:check` | `node scripts/check-tool-boundaries.mjs` |
| `pnpm tools:list` | `node scripts/list-tool-contracts.mjs` |
| `pnpm trace:artifact` | `node scripts/trace-artifact.mjs` |
| `pnpm trace:cost` | `node scripts/trace-cost.mjs` |
| `pnpm trace:provider` | `node scripts/trace-provider-call.mjs` |
| `pnpm trace:run` | `node scripts/trace-run.mjs` |
| `pnpm validate:knowledge` | `node scripts/validate-knowledge.mjs` |
| `pnpm workflows:list` | `node scripts/list-workflows.mjs` |
| `pnpm workflows:route` | `node scripts/route-workflow.mjs` |
| `pnpm workflows:run` | `node scripts/run-workflow.mjs` |
