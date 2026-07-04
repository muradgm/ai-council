#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const [command = 'help', ...args] = process.argv.slice(2);

function run(script, scriptArgs = []) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script), ...scriptArgs], {
    cwd: root,
    stdio: 'inherit'
  });
  process.exitCode = result.status ?? 0;
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function dirsWithMarker(rel, marker) {
  const parent = path.join(root, rel);
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(parent, entry.name, marker)))
    .map(entry => entry.name)
    .sort();
}

function help() {
  console.log(`AI Council CLI

Usage:
  pnpm council <command> [args]

Core commands:
  help                                 Show this help
  init                                 Print the required startup reading order
  status                               Show knowledge-layer counts
  plan                                 Print the default council operating plan
  doctor                               Run repository diagnostics
  health                               Print machine-readable and human-readable health summary
  map                                  Generate docs/repo-map.md

Routing:
  route "<request>"                    Route a task to agents, engines, workflows, skills, and templates
  bootstrap "<project>" "<task>"       Generate a Codex startup prompt
  context "<project>" "<task>"         Generate a Codex context pack

Projects:
  project:list                         List known product/project folders and memory records
  project:init <name> "<description>"  Create a new project scaffold and memory record
  project:doctor <name>                Check project runtime readiness

Evals and gates:
  evals:list                           List eval suites
  evals:route "<request>"             Route a request to eval suites
  evals:run                            Run deterministic eval suites
  gates:run                            Run quality gates
  evals:report                         Print latest eval report


Observability:
  observability:init                    Initialize observability storage
  observability:status                  Show trace, cost, artifact, and diagnostic counts
  console                               Print Web Console run instructions
  console:status                        Show Web Console readiness and catalog counts
  console:snapshot                      Write a Web Console inventory snapshot
  trace:run <project> <task> <summary>  Record a Council run trace
  trace:provider <provider> <purpose>   Record a provider-call trace
  trace:artifact <path> <type>          Record an artifact registry entry
  trace:cost <category> <amount>        Record a cost entry
  diagnostics:report                    Generate a diagnostics report
  observability:report                  Generate a local observability report
  artifacts:list                        List recorded artifacts

Providers and tools:
  providers:list                        List configured provider options
  providers:route "<request>"          Route task to local/freemium/premium providers
  providers:health                      Check provider environment configuration
  providers:policy <name>               Print provider policy
  tools:list                            List tool contracts
  tools:check "<request>"              Check tool safety boundaries


Automation:
  automation:init                      Initialize automation storage
  automation:status                    Show automation storage counts
  backlog:add <project> "title" "desc" Add a backlog item
  backlog:list <project>               List project backlog items
  sprint:plan <project> "goal"         Generate a sprint plan
  task:queue <action> <project>         Manage task queue
  github:issue <project> "task"        Generate GitHub issue draft
  codex:task <project> "task"          Generate Codex task prompt
  release:checklist <project> "scope"  Generate release checklist
  docs:update <project> "change"       Generate docs update plan
  automation:report                    Generate automation report

Governance:
  governance:init                      Initialize governance storage
  governance:status                    Show governance counts
  act <project> "request" --dry-run    Plan governed actions and write an action report
  permissions:check "action"          Classify action permission and approval need
  approvals:request <project> "action" Create approval request
  approvals:list                       List approval requests
  secrets:scan [path]                  Scan local files for secret patterns
  prompt-injection:check "text"       Check text for prompt-injection patterns
  finance:governance "request"       Apply trading/finance governance boundaries
  audit:record <kind> "summary"       Write audit record
  governance:report                    Generate governance report
  governance:doctor                    Check governance package readiness

Project packs:
  project-packs:list                    List project packs
  project-packs:route "<request>"       Route a request to project packs
  project-pack:status                   Check project pack readiness
  project-pack:context <project> "task" Generate project-specific Codex context
  project-pack:sync                     Sync pack context into projects/


Release and final integration:
  release:status                      Show v2.0.0 release status and layer counts
  release:notes                       Print v2.0.0 release notes
  final:validate                      Run final integrated foundation validation
  docs:commands                       Generate docs/commands/command-reference.generated.md
  docs:repo-map                       Generate docs/repo-map.final.md

Specialized packages:
  skills:list                          Use package script
  agents:list                          Use package script
  engines:list                         Use package script
  workflows:list                       Use package script
  templates:list                       Use package script
`);
}

function init() {
  console.log('AI Council initialized.');
  console.log('Read in this order before execution:');
  console.log('1. AGENTS.md');
  console.log('2. packages/orchestrator/bootstrap.md');
  console.log('3. docs/codex-startup-guide.md');
  console.log('4. docs/codex-one-command-setup.md');
  console.log('5. The relevant project context from storage/memory/projects/<Project>/project-context.md');
}

function status() {
  const counts = {
    skills: dirsWithMarker('packages/skills', 'SKILL.md').length,
    agents: dirsWithMarker('packages/senior-agents', 'AGENT.md').length,
    engines: dirsWithMarker('packages/decision-engines', 'ENGINE.md').length,
    workflows: dirsWithMarker('packages/workflows', 'WORKFLOW.md').length,
    templates: dirsWithMarker('packages/templates/deliverables', 'TEMPLATE.md').length,
    projects: exists('projects') ? fs.readdirSync(path.join(root, 'projects'), { withFileTypes: true }).filter(x => x.isDirectory()).length : 0,
    providers: exists('packages/ai-providers/providers.index.json') ? JSON.parse(fs.readFileSync(path.join(root, 'packages/ai-providers/providers.index.json'), 'utf8')).providers.length : 0,
    toolContracts: dirsWithMarker('packages/tool-contracts/contracts', 'TOOL.md').length,
    automationCapabilities: dirsWithMarker('packages/automation/capabilities', 'CAPABILITY.md').length,
    governanceCapabilities: dirsWithMarker('packages/governance/capabilities', 'CAPABILITY.md').length
  };
  for (const [k, v] of Object.entries(counts)) console.log(`${k}: ${v}`);
}

function plan() {
  console.log(`Default AI Council operating plan:
1. Understand the user's request and identify the target project.
2. Load project context, memory, task state, and recent decisions.
3. Route to senior agents based on domain and risk.
4. Select decision engines for tradeoffs, risk, architecture, security, product, brand, or trading questions.
5. Load only the required skills, workflows, templates, and checklists.
6. Produce a plan before changing code when the change is structural or high risk.
7. Execute in small, testable steps.
8. Run validation, diagnostics, and relevant quality gates.
9. Update memory, decisions, docs, and task state.
10. Report what changed, what was verified, and what remains open.`);
}

switch (command) {
  case 'help': help(); break;
  case 'init': init(); break;
  case 'status': status(); break;
  case 'plan': plan(); break;
  case 'doctor': run('council-doctor.mjs', args); break;
  case 'health': run('council-health.mjs', args); break;
  case 'map': run('generate-repo-map.mjs', args); break;
  case 'route': run('council-route.mjs', args); break;
  case 'bootstrap': run('codex-bootstrap.mjs', args); break;
  case 'context': run('codex-context.mjs', args); break;
  case 'project:list': run('list-projects.mjs', args); break;
  case 'project:init': run('init-project.mjs', args); break;
  case 'project:doctor': run('project-doctor.mjs', args); break;
  case 'evals:list': run('list-evals.mjs', args); break;
  case 'evals:route': run('route-eval.mjs', args); break;
  case 'evals:run': run('run-evals.mjs', args); break;
  case 'gates:run': run('run-quality-gates.mjs', args); break;
  case 'evals:report': run('eval-report.mjs', args); break;
  case 'observability:init': run('observability-init.mjs', args); break;
  case 'observability:status': run('observability-status.mjs', args); break;
  case 'console': run('console-open.mjs', args); break;
  case 'console:status': run('console-status.mjs', args); break;
  case 'console:snapshot': run('console-snapshot.mjs', args); break;
  case 'trace:run': run('trace-run.mjs', args); break;
  case 'trace:provider': run('trace-provider-call.mjs', args); break;
  case 'trace:artifact': run('trace-artifact.mjs', args); break;
  case 'trace:cost': run('trace-cost.mjs', args); break;
  case 'diagnostics:report': run('diagnostics-report.mjs', args); break;
  case 'observability:report': run('observability-report.mjs', args); break;
  case 'artifacts:list': run('list-artifacts.mjs', args); break;
  case 'providers:list': run('list-providers.mjs', args); break;
  case 'providers:route': run('route-provider.mjs', args); break;
  case 'providers:health': run('provider-health.mjs', args); break;
  case 'providers:policy': run('provider-policy.mjs', args); break;
  case 'tools:list': run('list-tool-contracts.mjs', args); break;
  case 'tools:check': run('check-tool-boundaries.mjs', args); break;
  case 'automation:init': run('automation-init.mjs', args); break;
  case 'automation:status': run('automation-status.mjs', args); break;
  case 'backlog:add': run('backlog-add.mjs', args); break;
  case 'backlog:list': run('backlog-list.mjs', args); break;
  case 'sprint:plan': run('sprint-plan.mjs', args); break;
  case 'task:queue': run('task-queue.mjs', args); break;
  case 'github:issue': run('github-issue-generate.mjs', args); break;
  case 'codex:task': run('codex-task-generate.mjs', args); break;
  case 'release:checklist': run('release-checklist.mjs', args); break;
  case 'docs:update': run('docs-update-plan.mjs', args); break;
  case 'automation:report': run('automation-report.mjs', args); break;
  case 'governance:init': run('governance-init.mjs', args); break;
  case 'governance:status': run('governance-status.mjs', args); break;
  case 'act': run('council-act.mjs', args); break;
  case 'permissions:check': run('permissions-check.mjs', args); break;
  case 'approvals:request': run('approvals-request.mjs', args); break;
  case 'approvals:list': run('approvals-list.mjs', args); break;
  case 'secrets:scan': run('secrets-scan.mjs', args); break;
  case 'prompt-injection:check': run('prompt-injection-check.mjs', args); break;
  case 'finance:governance': run('finance-governance-check.mjs', args); break;
  case 'audit:record': run('audit-record.mjs', args); break;
  case 'governance:report': run('governance-report.mjs', args); break;
  case 'governance:doctor': run('governance-doctor.mjs', args); break;
  case 'project-packs:list': run('list-project-packs.mjs', args); break;
  case 'project-packs:route': run('route-project-pack.mjs', args); break;
  case 'project-pack:status': run('project-pack-status.mjs', args); break;
  case 'project-pack:context': run('project-pack-context.mjs', args); break;
  case 'project-pack:sync': run('sync-project-packs.mjs', args); break;
  case 'release:status': run('release-status.mjs', args); break;
  case 'release:notes': run('release-notes.mjs', args); break;
  case 'final:validate': run('final-validation.mjs', args); break;
  case 'docs:commands': run('generate-command-reference.mjs', args); break;
  case 'docs:repo-map': run('generate-final-repo-map.mjs', args); break;

  default:
    console.error(`Unknown council command: ${command}`);
    help();
    process.exitCode = 1;
}
