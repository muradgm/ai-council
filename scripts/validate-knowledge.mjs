import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;

function exists(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error(`Missing required path: ${rel}`);
    failed = true;
    return false;
  }
  return true;
}

const requiredRoots = [
  'AGENTS.md',
  'packages/orchestrator/bootstrap.md',
  'packages/skills',
  'packages/senior-agents',
  'packages/decision-engines',
  'packages/decision-engines/index.json',
  'packages/decision-engines/registry.md',
  'packages/workflows',
  'packages/workflows/workflows.index.json',
  'packages/workflows/registry.md',
  'docs/skills-system.md',
  'docs/senior-agents-system.md',
  'docs/decision-engines-system.md',
  'docs/workflow-orchestration-system.md'
];
for (const rel of requiredRoots) exists(rel);

function dirsWithMarker(parent, marker) {
  if (!fs.existsSync(parent)) return [];
  return fs.readdirSync(parent).filter(name => {
    const p = path.join(parent, name);
    return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, marker));
  });
}

const skillsDir = path.join(root, 'packages', 'skills');
const skillNames = dirsWithMarker(skillsDir, 'SKILL.md');
const requiredSkillFiles = [
  'SKILL.md',
  'skill.json',
  'README.md',
  'workflows/standard.workflow.md',
  'checklists/quality.checklist.md',
  'templates/decision-memo.template.md'
];
for (const skill of skillNames) {
  for (const file of requiredSkillFiles) {
    if (!fs.existsSync(path.join(skillsDir, skill, file))) {
      console.error(`Skill ${skill} missing ${file}`);
      failed = true;
    }
  }
}
if (skillNames.length < 60) {
  console.error(`Expected at least 60 skills, found ${skillNames.length}`);
  failed = true;
}

const agentsDir = path.join(root, 'packages', 'senior-agents');
const agentNames = dirsWithMarker(agentsDir, 'AGENT.md');
const requiredAgentFiles = [
  'AGENT.md',
  'agent.json',
  'instructions.md',
  'workflow.md',
  'skill-map.md',
  'checklists/agent-quality.checklist.md',
  'templates/agent-brief.template.md',
  'prompts/invoke.prompt.md',
  'handoffs/standard-handoff.md'
];
for (const agent of agentNames) {
  for (const file of requiredAgentFiles) {
    if (!fs.existsSync(path.join(agentsDir, agent, file))) {
      console.error(`Agent ${agent} missing ${file}`);
      failed = true;
    }
  }
  const manifestPath = path.join(agentsDir, agent, 'agent.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!manifest.name || !manifest.entrypoint || !Array.isArray(manifest.skills) || !Array.isArray(manifest.keywords)) {
        console.error(`Agent ${agent} has invalid manifest shape`);
        failed = true;
      }
      for (const skill of manifest.skills || []) {
        if (!skillNames.includes(skill)) {
          console.error(`Agent ${agent} references missing skill: ${skill}`);
          failed = true;
        }
      }
    } catch {
      console.error(`Agent ${agent} has invalid JSON manifest`);
      failed = true;
    }
  }
}
if (agentNames.length < 40) {
  console.error(`Expected at least 40 senior agents, found ${agentNames.length}`);
  failed = true;
}

const enginesDir = path.join(root, 'packages', 'decision-engines');
const engineNames = dirsWithMarker(enginesDir, 'ENGINE.md');
const requiredEngineFiles = [
  'ENGINE.md',
  'engine.json',
  'README.md',
  'workflow.md',
  'rubric.md',
  'workflows/standard.workflow.md',
  'rubrics/scoring-rubric.md',
  'checklists/preflight.checklist.md',
  'checklists/quality-gate.checklist.md',
  'templates/decision-memo.template.md',
  'prompts/invoke.prompt.md',
  'examples/example-decision.md',
  'references/README.md'
];
for (const engine of engineNames) {
  for (const file of requiredEngineFiles) {
    if (!fs.existsSync(path.join(enginesDir, engine, file))) {
      console.error(`Decision engine ${engine} missing ${file}`);
      failed = true;
    }
  }
  const manifestPath = path.join(enginesDir, engine, 'engine.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const valid = manifest.name && manifest.title && manifest.entrypoint && manifest.category &&
        Array.isArray(manifest.skills) && Array.isArray(manifest.ownerAgents) &&
        Array.isArray(manifest.keywords) && Array.isArray(manifest.rubricCriteria);
      if (!valid) {
        console.error(`Decision engine ${engine} has invalid manifest shape`);
        failed = true;
      }
      for (const skill of manifest.skills || []) {
        if (!skillNames.includes(skill)) {
          console.error(`Decision engine ${engine} references missing skill: ${skill}`);
          failed = true;
        }
      }
      for (const agent of manifest.ownerAgents || []) {
        if (!agentNames.includes(agent)) {
          console.error(`Decision engine ${engine} references missing agent: ${agent}`);
          failed = true;
        }
      }
    } catch {
      console.error(`Decision engine ${engine} has invalid JSON manifest`);
      failed = true;
    }
  }
}
if (engineNames.length < 30) {
  console.error(`Expected at least 30 decision engines, found ${engineNames.length}`);
  failed = true;
}



const workflowsDir = path.join(root, 'packages', 'workflows');
const workflowNames = dirsWithMarker(workflowsDir, 'WORKFLOW.md');
const requiredWorkflowFiles = [
  'WORKFLOW.md',
  'workflow.json',
  'README.md',
  'phases/01-intake.md',
  'phases/02-routing.md',
  'phases/03-analysis.md',
  'phases/04-plan.md',
  'phases/05-execute.md',
  'phases/06-review.md',
  'templates/workflow-brief.template.md',
  'templates/final-report.template.md',
  'checklists/preflight.checklist.md',
  'checklists/quality-gate.checklist.md',
  'prompts/invoke.prompt.md',
  'examples/example-run.md',
  'handoffs/standard-handoff.md',
  'references/README.md'
];
for (const workflow of workflowNames) {
  for (const file of requiredWorkflowFiles) {
    if (!fs.existsSync(path.join(workflowsDir, workflow, file))) {
      console.error(`Workflow ${workflow} missing ${file}`);
      failed = true;
    }
  }
  const manifestPath = path.join(workflowsDir, workflow, 'workflow.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const valid = manifest.name && manifest.title && manifest.entrypoint && manifest.category &&
        Array.isArray(manifest.agents) && Array.isArray(manifest.skills) &&
        Array.isArray(manifest.decisionEngines) && Array.isArray(manifest.phases) &&
        Array.isArray(manifest.outputs) && Array.isArray(manifest.qualityGates);
      if (!valid) {
        console.error(`Workflow ${workflow} has invalid manifest shape`);
        failed = true;
      }
      for (const skill of manifest.skills || []) {
        if (!skillNames.includes(skill)) {
          console.error(`Workflow ${workflow} references missing skill: ${skill}`);
          failed = true;
        }
      }
      for (const agent of manifest.agents || []) {
        if (!agentNames.includes(agent)) {
          console.error(`Workflow ${workflow} references missing agent: ${agent}`);
          failed = true;
        }
      }
      for (const engine of manifest.decisionEngines || []) {
        if (!engineNames.includes(engine)) {
          console.error(`Workflow ${workflow} references missing decision engine: ${engine}`);
          failed = true;
        }
      }
    } catch {
      console.error(`Workflow ${workflow} has invalid JSON manifest`);
      failed = true;
    }
  }
}
if (workflowNames.length < 30) {
  console.error(`Expected at least 30 workflows, found ${workflowNames.length}`);
  failed = true;
}



const templatesDir = path.join(root, 'packages', 'templates', 'deliverables');
exists('packages/templates');
exists('packages/templates/templates.index.json');
exists('packages/templates/registry.md');
exists('docs/templates-deliverables-system.md');
const templateNames = dirsWithMarker(templatesDir, 'TEMPLATE.md');
const requiredTemplateFiles = [
  'TEMPLATE.md',
  'template.json',
  'checklist.md',
  'example.md',
  'prompt.md'
];
for (const template of templateNames) {
  for (const file of requiredTemplateFiles) {
    if (!fs.existsSync(path.join(templatesDir, template, file))) {
      console.error(`Template ${template} missing ${file}`);
      failed = true;
    }
  }
  const manifestPath = path.join(templatesDir, template, 'template.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const valid = manifest.name && manifest.title && manifest.entrypoint && manifest.category &&
        Array.isArray(manifest.skills) && Array.isArray(manifest.agents) &&
        Array.isArray(manifest.decisionEngines) && Array.isArray(manifest.workflows) &&
        Array.isArray(manifest.keywords) && Array.isArray(manifest.outputs);
      if (!valid) {
        console.error(`Template ${template} has invalid manifest shape`);
        failed = true;
      }
      for (const skill of manifest.skills || []) {
        if (!skillNames.includes(skill)) {
          console.error(`Template ${template} references missing skill: ${skill}`);
          failed = true;
        }
      }
      for (const agent of manifest.agents || []) {
        if (!agentNames.includes(agent)) {
          console.error(`Template ${template} references missing agent: ${agent}`);
          failed = true;
        }
      }
      for (const engine of manifest.decisionEngines || []) {
        if (!engineNames.includes(engine)) {
          console.error(`Template ${template} references missing decision engine: ${engine}`);
          failed = true;
        }
      }
      for (const workflow of manifest.workflows || []) {
        if (!workflowNames.includes(workflow)) {
          console.error(`Template ${template} references missing workflow: ${workflow}`);
          failed = true;
        }
      }
    } catch {
      console.error(`Template ${template} has invalid JSON manifest`);
      failed = true;
    }
  }
}
if (templateNames.length < 35) {
  console.error(`Expected at least 35 templates, found ${templateNames.length}`);
  failed = true;
}


// Phase 7: Memory + Project Runtime validation
const memoryRequired = [
  'packages/memory',
  'packages/memory/README.md',
  'packages/memory/MEMORY.md',
  'packages/memory/memory.index.json',
  'packages/memory/memory.schema.json',
  'packages/memory/templates/PROJECT_CONTEXT.md',
  'packages/memory/templates/SESSION_SUMMARY.md',
  'packages/memory/templates/DECISION_RECORD.md',
  'packages/memory/templates/TASK_STATE.md',
  'packages/memory/templates/CONTEXT_PACK.md',
  'packages/memory/loaders/context-priority.md',
  'packages/memory/loaders/freshness-policy.md',
  'packages/memory/loaders/conflict-resolution.md',
  'packages/memory/loaders/token-budgeting.md',
  'storage/memory',
  'storage/context-packs',
  'docs/memory-project-runtime-system.md',
  'docs/codex-runtime-guide.md',
  'docs/specs/memory-spec.md',
  'scripts/memory-init.mjs',
  'scripts/memory-status.mjs',
  'scripts/build-context-pack.mjs',
  'scripts/record-decision.mjs',
  'scripts/session-summary.mjs',
  'scripts/task-state.mjs',
  'scripts/project-context.mjs'
];
for (const rel of memoryRequired) exists(rel);

try {
  const memoryIndex = JSON.parse(fs.readFileSync(path.join(root, 'packages/memory/memory.index.json'), 'utf8'));
  if (!Array.isArray(memoryIndex.recordTypes) || memoryIndex.recordTypes.length < 5) {
    console.error('Memory index has invalid recordTypes');
    failed = true;
  }
} catch {
  console.error('Memory index JSON is invalid');
  failed = true;
}

const sampleProjects = ['TradeFrame', 'SignalScout', 'NAVO', 'Swimly'];
for (const project of sampleProjects) {
  exists(`storage/memory/projects/${project}/project-context.md`);
}



// Phase 8: CLI + Developer Experience validation
const dxRequired = [
  'packages/cli',
  'packages/cli/CLI.md',
  'packages/cli/commands.md',
  'packages/cli/COMMANDS.json',
  'docs/developer-experience.md',
  'docs/cli-reference.md',
  'docs/codex-one-command-setup.md',
  'docs/repo-diagnostics.md',
  'docs/project-initialization.md',
  'docs/phase-08-cli-developer-experience.md',
  'scripts/council.mjs',
  'scripts/lib/council-utils.mjs',
  'scripts/council-health.mjs',
  'scripts/council-doctor.mjs',
  'scripts/council-route.mjs',
  'scripts/codex-bootstrap.mjs',
  'scripts/codex-context.mjs',
  'scripts/init-project.mjs',
  'scripts/list-projects.mjs',
  'scripts/project-doctor.mjs',
  'scripts/generate-repo-map.mjs',
  '.vscode/tasks.json',
  '.github/workflows/knowledge-validation.yml'
];
for (const rel of dxRequired) exists(rel);

try {
  const commands = JSON.parse(fs.readFileSync(path.join(root, 'packages/cli/COMMANDS.json'), 'utf8'));
  if (!Array.isArray(commands.commands) || commands.commands.length < 8) {
    console.error('CLI commands manifest has invalid command list');
    failed = true;
  }
} catch {
  console.error('CLI commands manifest is invalid JSON');
  failed = true;
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const scriptName of ['council', 'council:doctor', 'council:route', 'codex:context', 'project:init', 'project:doctor', 'repo:map']) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.error(`package.json missing script: ${scriptName}`);
    failed = true;
  }
}



// Phase 9: Evals + Quality Gates validation
const evalRequired = [
  'packages/evals',
  'packages/evals/README.md',
  'packages/evals/EVALS.md',
  'packages/evals/evals.index.json',
  'packages/evals/eval.schema.json',
  'packages/evals/registry.md',
  'packages/evals/rubrics/global-output-rubric.md',
  'packages/evals/rubrics/routing-rubric.md',
  'packages/evals/rubrics/trading-risk-rubric.md',
  'packages/evals/rubrics/domain-safety-rubric.md',
  'packages/evals/quality-gates/README.md',
  'packages/evals/reports/eval-report.template.md',
  'packages/evals/reports/quality-gate-report.template.md',
  'docs/evals-quality-gates-system.md',
  'docs/codex-evals-guide.md',
  'docs/quality-gates.md',
  'docs/specs/eval-spec.md',
  'docs/phase-09-evals-quality-gates.md',
  'scripts/list-evals.mjs',
  'scripts/route-eval.mjs',
  'scripts/run-evals.mjs',
  'scripts/run-quality-gates.mjs',
  'scripts/eval-report.mjs',
  '.github/workflows/evals-quality-gates.yml'
];
for (const rel of evalRequired) exists(rel);

const evalSuitesDir = path.join(root, 'packages', 'evals', 'suites');
const evalSuiteNames = dirsWithMarker(evalSuitesDir, 'SUITE.md');
const requiredEvalSuiteFiles = [
  'SUITE.md',
  'suite.json',
  'rubric.md',
  'checklist.md',
  'golden/golden-route.md'
];
for (const suite of evalSuiteNames) {
  for (const file of requiredEvalSuiteFiles) {
    if (!fs.existsSync(path.join(evalSuitesDir, suite, file))) {
      console.error(`Eval suite ${suite} missing ${file}`);
      failed = true;
    }
  }
  const casesDir = path.join(evalSuitesDir, suite, 'cases');
  const caseFiles = fs.existsSync(casesDir) ? fs.readdirSync(casesDir).filter(file => file.endsWith('.json')) : [];
  if (caseFiles.length < 3) {
    console.error(`Eval suite ${suite} should include at least 3 cases`);
    failed = true;
  }
  const manifestPath = path.join(evalSuitesDir, suite, 'suite.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const valid = manifest.name && manifest.title && manifest.entrypoint && manifest.category &&
        Array.isArray(manifest.keywords) && Array.isArray(manifest.expectedAgents) &&
        Array.isArray(manifest.expectedEngines) && Array.isArray(manifest.expectedWorkflows) &&
        Array.isArray(manifest.expectedSkills) && Array.isArray(manifest.expectedTemplates);
      if (!valid) {
        console.error(`Eval suite ${suite} has invalid manifest shape`);
        failed = true;
      }
      for (const agent of manifest.expectedAgents || []) if (!agentNames.includes(agent)) { console.error(`Eval suite ${suite} references missing agent: ${agent}`); failed = true; }
      for (const engine of manifest.expectedEngines || []) if (!engineNames.includes(engine)) { console.error(`Eval suite ${suite} references missing engine: ${engine}`); failed = true; }
      for (const workflow of manifest.expectedWorkflows || []) if (!workflowNames.includes(workflow)) { console.error(`Eval suite ${suite} references missing workflow: ${workflow}`); failed = true; }
      for (const skill of manifest.expectedSkills || []) if (!skillNames.includes(skill)) { console.error(`Eval suite ${suite} references missing skill: ${skill}`); failed = true; }
      for (const template of manifest.expectedTemplates || []) if (!templateNames.includes(template)) { console.error(`Eval suite ${suite} references missing template: ${template}`); failed = true; }
    } catch {
      console.error(`Eval suite ${suite} has invalid JSON manifest`);
      failed = true;
    }
  }
}
if (evalSuiteNames.length < 10) {
  console.error(`Expected at least 10 eval suites, found ${evalSuiteNames.length}`);
  failed = true;
}

const qualityGateNames = dirsWithMarker(path.join(root, 'packages', 'evals', 'quality-gates'), 'GATE.md');
for (const gate of qualityGateNames) {
  for (const file of ['GATE.md', 'gate.json', 'checklist.md']) {
    if (!fs.existsSync(path.join(root, 'packages', 'evals', 'quality-gates', gate, file))) {
      console.error(`Quality gate ${gate} missing ${file}`);
      failed = true;
    }
  }
}
if (qualityGateNames.length < 6) {
  console.error(`Expected at least 6 quality gates, found ${qualityGateNames.length}`);
  failed = true;
}

try {
  const evalIndex = JSON.parse(fs.readFileSync(path.join(root, 'packages/evals/evals.index.json'), 'utf8'));
  if (!Array.isArray(evalIndex.suites) || evalIndex.suites.length < 10) {
    console.error('Eval index has invalid suite list');
    failed = true;
  }
} catch {
  console.error('Eval index JSON is invalid');
  failed = true;
}

for (const scriptName of ['evals:list', 'evals:route', 'evals:run', 'gates:run', 'evals:report']) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.error(`package.json missing script: ${scriptName}`);
    failed = true;
  }
}



// Phase 10: Provider + Tool Integration validation
const providerRequired = [
  'packages/ai-providers',
  'packages/ai-providers/README.md',
  'packages/ai-providers/PROVIDERS.md',
  'packages/ai-providers/providers.index.json',
  'packages/ai-providers/provider.schema.json',
  'packages/ai-providers/policies/model-routing-policy.md',
  'packages/ai-providers/policies/privacy-policy.md',
  'packages/ai-providers/policies/cost-policy.md',
  'packages/ai-providers/policies/fallback-policy.md',
  'packages/ai-providers/policies/local-cloud-policy.md',
  'packages/ai-providers/policies/trading-finance-policy.md',
  'packages/tool-contracts',
  'packages/tool-contracts/README.md',
  'packages/tool-contracts/TOOL_CONTRACTS.md',
  'packages/tool-contracts/tools.index.json',
  'packages/tool-contracts/tool.schema.json',
  'packages/tool-contracts/boundaries/safe-execution-boundaries.md',
  'packages/tool-contracts/boundaries/approval-matrix.md',
  'packages/tool-contracts/boundaries/logging-policy.md',
  'docs/providers-tool-integration-system.md',
  'docs/codex-providers-guide.md',
  'docs/model-routing-policy.md',
  'docs/local-cloud-fallback.md',
  'docs/tool-safety-boundaries.md',
  'docs/phase-10-provider-tool-integration.md',
  'scripts/list-providers.mjs',
  'scripts/route-provider.mjs',
  'scripts/provider-health.mjs',
  'scripts/provider-policy.mjs',
  'scripts/generate-provider-env.mjs',
  'scripts/list-tool-contracts.mjs',
  'scripts/check-tool-boundaries.mjs'
];
for (const rel of providerRequired) exists(rel);

let providerNames = [];
try {
  const providerIndex = JSON.parse(fs.readFileSync(path.join(root, 'packages/ai-providers/providers.index.json'), 'utf8'));
  providerNames = providerIndex.providers?.map(p => p.id) || [];
  if (!Array.isArray(providerIndex.providers) || providerIndex.providers.length < 10) {
    console.error('Provider index has too few providers');
    failed = true;
  }
  for (const provider of providerIndex.providers || []) {
    const valid = provider.id && provider.name && provider.tier && Array.isArray(provider.strengths) && Array.isArray(provider.models) && Array.isArray(provider.env);
    if (!valid) {
      console.error(`Provider has invalid manifest shape: ${provider.id || '(unknown)'}`);
      failed = true;
    }
  }
} catch {
  console.error('Provider index JSON is invalid');
  failed = true;
}

const toolContractNames = dirsWithMarker(path.join(root, 'packages', 'tool-contracts', 'contracts'), 'TOOL.md');
for (const tool of toolContractNames) {
  for (const file of ['TOOL.md', 'tool.json', 'checklist.md', 'example.md']) {
    if (!fs.existsSync(path.join(root, 'packages', 'tool-contracts', 'contracts', tool, file))) {
      console.error(`Tool contract ${tool} missing ${file}`);
      failed = true;
    }
  }
}
if (toolContractNames.length < 15) {
  console.error(`Expected at least 15 tool contracts, found ${toolContractNames.length}`);
  failed = true;
}

try {
  const toolsIndex = JSON.parse(fs.readFileSync(path.join(root, 'packages/tool-contracts/tools.index.json'), 'utf8'));
  if (!Array.isArray(toolsIndex.contracts) || toolsIndex.contracts.length < 15) {
    console.error('Tool contracts index has too few contracts');
    failed = true;
  }
} catch {
  console.error('Tool contracts index JSON is invalid');
  failed = true;
}

for (const scriptName of ['providers:list', 'providers:route', 'providers:health', 'providers:policy', 'providers:env', 'tools:list', 'tools:check']) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.error(`package.json missing script: ${scriptName}`);
    failed = true;
  }
}



// Phase 11: Storage, Observability + Trace validation
const observabilityRequired = [
  'packages/observability',
  'packages/observability/README.md',
  'packages/observability/OBSERVABILITY.md',
  'packages/observability/observability.index.json',
  'packages/observability/run.schema.json',
  'packages/observability/trace.schema.json',
  'packages/observability/provider-call.schema.json',
  'packages/observability/cost.schema.json',
  'packages/observability/artifact.schema.json',
  'packages/observability/diagnostic.schema.json',
  'packages/observability/incident.schema.json',
  'packages/observability/policies/logging-policy.md',
  'packages/observability/policies/privacy-redaction-policy.md',
  'packages/observability/policies/retention-policy.md',
  'packages/observability/policies/cost-tracking-policy.md',
  'packages/observability/policies/trace-sampling-policy.md',
  'packages/observability/policies/provider-call-trace-policy.md',
  'packages/observability/templates/RUN_TRACE.md',
  'packages/observability/templates/PROVIDER_CALL_TRACE.md',
  'packages/observability/templates/WORKFLOW_EXECUTION.md',
  'packages/observability/templates/ARTIFACT_RECORD.md',
  'packages/observability/templates/COST_RECORD.md',
  'packages/observability/templates/DIAGNOSTIC_REPORT.md',
  'packages/observability/templates/INCIDENT_REPORT.md',
  'packages/observability/dashboards/local-dashboard.md',
  'packages/observability/dashboards/metrics-catalog.md',
  'packages/observability/checklists/trace-quality.checklist.md',
  'packages/observability/checklists/cost-review.checklist.md',
  'storage/observability',
  'storage/observability/runs',
  'storage/observability/traces',
  'storage/observability/provider-calls',
  'storage/observability/costs',
  'storage/observability/artifacts',
  'storage/observability/diagnostics',
  'storage/observability/reports',
  'storage/observability/incidents',
  'docs/observability-trace-system.md',
  'docs/codex-observability-guide.md',
  'docs/specs/observability-spec.md',
  'docs/phase-11-storage-observability-trace.md',
  'scripts/observability-init.mjs',
  'scripts/observability-status.mjs',
  'scripts/trace-run.mjs',
  'scripts/trace-provider-call.mjs',
  'scripts/trace-artifact.mjs',
  'scripts/trace-cost.mjs',
  'scripts/diagnostics-report.mjs',
  'scripts/observability-report.mjs',
  'scripts/list-artifacts.mjs'
];
for (const rel of observabilityRequired) exists(rel);

try {
  const obsIndex = JSON.parse(fs.readFileSync(path.join(root, 'packages/observability/observability.index.json'), 'utf8'));
  if (!Array.isArray(obsIndex.recordTypes) || obsIndex.recordTypes.length < 6) {
    console.error('Observability index has invalid recordTypes');
    failed = true;
  }
  if (!Array.isArray(obsIndex.commands) || obsIndex.commands.length < 6) {
    console.error('Observability index has invalid commands');
    failed = true;
  }
} catch {
  console.error('Observability index JSON is invalid');
  failed = true;
}

for (const scriptName of ['observability:init', 'observability:status', 'trace:run', 'trace:provider', 'trace:artifact', 'trace:cost', 'diagnostics:report', 'observability:report', 'artifacts:list']) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.error(`package.json missing script: ${scriptName}`);
    failed = true;
  }
}



// Phase 12: Apps + Web Console validation
const consoleRequired = [
  'apps/web-console',
  'apps/web-console/index.html',
  'apps/web-console/package.json',
  'apps/web-console/README.md',
  'apps/web-console/console.config.json',
  'apps/web-console/src/main.ts',
  'apps/web-console/src/api.ts',
  'apps/web-console/src/state.ts',
  'apps/web-console/src/types.ts',
  'apps/web-console/src/styles.css',
  'apps/api-server/src/main.ts',
  'docs/web-console-system.md',
  'docs/codex-web-console-guide.md',
  'docs/specs/web-console-spec.md',
  'docs/phase-12-apps-web-console.md',
  'storage/web-console',
  'storage/web-console/snapshots',
  'scripts/console-status.mjs',
  'scripts/console-snapshot.mjs',
  'scripts/console-open.mjs'
];
for (const rel of consoleRequired) exists(rel);

try {
  const consoleConfig = JSON.parse(fs.readFileSync(path.join(root, 'apps/web-console/console.config.json'), 'utf8'));
  if (!Array.isArray(consoleConfig.panels) || consoleConfig.panels.length < 6) {
    console.error('Web Console config has invalid panels list');
    failed = true;
  }
} catch {
  console.error('Web Console config JSON is invalid');
  failed = true;
}

for (const scriptName of ['dev:web', 'dev:api', 'console:status', 'console:snapshot', 'console:open', 'council:console']) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.error(`package.json missing script: ${scriptName}`);
    failed = true;
  }
}



// Phase 13: Project Packs validation
const projectPackRequired = [
  'packages/project-packs',
  'packages/project-packs/README.md',
  'packages/project-packs/PROJECT_PACKS.md',
  'packages/project-packs/project-packs.index.json',
  'packages/project-packs/project-pack.schema.json',
  'docs/project-packs-system.md',
  'docs/codex-project-packs-guide.md',
  'docs/specs/project-pack-spec.md',
  'docs/phase-13-project-packs.md',
  'scripts/list-project-packs.mjs',
  'scripts/route-project-pack.mjs',
  'scripts/project-pack-status.mjs',
  'scripts/project-pack-context.mjs',
  'scripts/sync-project-packs.mjs'
];
for (const rel of projectPackRequired) exists(rel);

const projectPacksDir = path.join(root, 'packages', 'project-packs');
const projectPackNames = dirsWithMarker(projectPacksDir, 'PROJECT_PACK.md');
const requiredProjectPackFiles = [
  'PROJECT_PACK.md',
  'project-pack.json',
  'README.md',
  'strategy/PRODUCT_STRATEGY.md',
  'strategy/WEDGE.md',
  'strategy/POSITIONING.md',
  'architecture/ARCHITECTURE.md',
  'architecture/DATA_MODEL.md',
  'architecture/INTEGRATIONS.md',
  'roadmap/ROADMAP.md',
  'roadmap/MILESTONES.md',
  'tasks/ACTIVE_TASKS.md',
  'tasks/BACKLOG.md',
  'risks/RISK_REGISTER.md',
  'decisions/DECISION_LOG.md',
  'codex/CODEX_CONTEXT.md',
  'codex/STARTUP_PROMPT.md',
  'workflows/BUILD_WORKFLOW.md',
  'workflows/REVIEW_WORKFLOW.md',
  'evals/ACCEPTANCE_CRITERIA.md',
  'memory/PROJECT_MEMORY.md',
  'deliverables/README.md',
  'references/README.md'
];
for (const pack of projectPackNames) {
  for (const file of requiredProjectPackFiles) {
    if (!fs.existsSync(path.join(projectPacksDir, pack, file))) {
      console.error(`Project pack ${pack} missing ${file}`);
      failed = true;
    }
  }
  const manifestPath = path.join(projectPacksDir, pack, 'project-pack.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const valid = manifest.name && manifest.title && manifest.kind && manifest.entrypoint && manifest.projectRoot && manifest.memoryRoot && manifest.wedge && manifest.stage &&
        Array.isArray(manifest.agents) && Array.isArray(manifest.skills) && Array.isArray(manifest.decisionEngines) &&
        Array.isArray(manifest.workflows) && Array.isArray(manifest.templates) && Array.isArray(manifest.keywords);
      if (!valid) {
        console.error(`Project pack ${pack} has invalid manifest shape`);
        failed = true;
      }
      for (const agent of manifest.agents || []) if (!agentNames.includes(agent)) { console.error(`Project pack ${pack} references missing agent: ${agent}`); failed = true; }
      for (const skill of manifest.skills || []) if (!skillNames.includes(skill)) { console.error(`Project pack ${pack} references missing skill: ${skill}`); failed = true; }
      for (const engine of manifest.decisionEngines || []) if (!engineNames.includes(engine)) { console.error(`Project pack ${pack} references missing engine: ${engine}`); failed = true; }
      for (const workflow of manifest.workflows || []) if (!workflowNames.includes(workflow)) { console.error(`Project pack ${pack} references missing workflow: ${workflow}`); failed = true; }
      for (const template of manifest.templates || []) if (!templateNames.includes(template)) { console.error(`Project pack ${pack} references missing template: ${template}`); failed = true; }
      if (!fs.existsSync(path.join(root, manifest.projectRoot, 'PROJECT.md'))) { console.error(`Project pack ${pack} project root missing PROJECT.md`); failed = true; }
      if (!fs.existsSync(path.join(root, manifest.memoryRoot, 'project-context.md'))) { console.error(`Project pack ${pack} memory root missing project-context.md`); failed = true; }
    } catch {
      console.error(`Project pack ${pack} has invalid JSON manifest`);
      failed = true;
    }
  }
}
if (projectPackNames.length < 4) {
  console.error(`Expected at least 4 project packs, found ${projectPackNames.length}`);
  failed = true;
}

try {
  const projectPackIndex = JSON.parse(fs.readFileSync(path.join(root, 'packages/project-packs/project-packs.index.json'), 'utf8'));
  if (!Array.isArray(projectPackIndex.packs) || projectPackIndex.packs.length < 4) {
    console.error('Project packs index has invalid pack list');
    failed = true;
  }
} catch {
  console.error('Project packs index JSON is invalid');
  failed = true;
}

for (const scriptName of ['project-packs:list', 'project-packs:route', 'project-pack:status', 'project-pack:context', 'project-pack:sync', 'council:project-packs']) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.error(`package.json missing script: ${scriptName}`);
    failed = true;
  }
}



// Phase 14: Automation + Task Execution validation
const automationRequired = [
  'packages/automation',
  'packages/automation/README.md',
  'packages/automation/AUTOMATION.md',
  'packages/automation/automation.index.json',
  'packages/automation/automation.schema.json',
  'packages/automation/task.schema.json',
  'packages/automation/sprint.schema.json',
  'packages/automation/release.schema.json',
  'packages/automation/github-issue.schema.json',
  'packages/automation/codex-task.schema.json',
  'packages/automation/docs-update.schema.json',
  'packages/automation/policies/task-execution-policy.md',
  'packages/automation/policies/approval-policy.md',
  'packages/automation/policies/backlog-policy.md',
  'packages/automation/policies/release-policy.md',
  'packages/automation/policies/github-policy.md',
  'packages/automation/policies/docs-update-policy.md',
  'packages/automation/templates/TASK.md',
  'packages/automation/templates/SPRINT_PLAN.md',
  'packages/automation/templates/RELEASE_CHECKLIST.md',
  'packages/automation/templates/GITHUB_ISSUE.md',
  'packages/automation/templates/CODEX_TASK_PROMPT.md',
  'packages/automation/templates/DOCS_UPDATE.md',
  'packages/automation/templates/TASK_REPORT.md',
  'packages/automation/checklists/task-readiness.checklist.md',
  'packages/automation/checklists/sprint-readiness.checklist.md',
  'packages/automation/checklists/release-readiness.checklist.md',
  'packages/automation/checklists/docs-update.checklist.md',
  'packages/automation/checklists/codex-task.checklist.md',
  'storage/automation',
  'storage/automation/backlog',
  'storage/automation/queue',
  'storage/automation/sprints',
  'storage/automation/releases',
  'storage/automation/github-issues',
  'storage/automation/codex-tasks',
  'storage/automation/docs-updates',
  'storage/automation/reports',
  'docs/automation-task-execution-system.md',
  'docs/codex-automation-guide.md',
  'docs/specs/automation-spec.md',
  'docs/phase-14-automation-task-execution.md',
  'scripts/lib/automation-utils.mjs',
  'scripts/automation-init.mjs',
  'scripts/automation-status.mjs',
  'scripts/backlog-add.mjs',
  'scripts/backlog-list.mjs',
  'scripts/sprint-plan.mjs',
  'scripts/task-queue.mjs',
  'scripts/github-issue-generate.mjs',
  'scripts/codex-task-generate.mjs',
  'scripts/release-checklist.mjs',
  'scripts/docs-update-plan.mjs',
  'scripts/automation-report.mjs'
];
for (const rel of automationRequired) exists(rel);

const automationCapabilities = dirsWithMarker(path.join(root, 'packages', 'automation', 'capabilities'), 'CAPABILITY.md');
for (const capability of automationCapabilities) {
  for (const file of ['CAPABILITY.md', 'capability.json', 'prompt.md', 'checklist.md', 'template.md']) {
    if (!fs.existsSync(path.join(root, 'packages', 'automation', 'capabilities', capability, file))) {
      console.error(`Automation capability ${capability} missing ${file}`);
      failed = true;
    }
  }
  const manifestPath = path.join(root, 'packages', 'automation', 'capabilities', capability, 'capability.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const valid = manifest.name && manifest.title && manifest.entrypoint && manifest.category &&
        Array.isArray(manifest.inputs) && Array.isArray(manifest.outputs) &&
        manifest.riskLevel && typeof manifest.approvalRequired === 'boolean' && Array.isArray(manifest.keywords);
      if (!valid) {
        console.error(`Automation capability ${capability} has invalid manifest shape`);
        failed = true;
      }
    } catch {
      console.error(`Automation capability ${capability} has invalid JSON manifest`);
      failed = true;
    }
  }
}
if (automationCapabilities.length < 8) {
  console.error(`Expected at least 8 automation capabilities, found ${automationCapabilities.length}`);
  failed = true;
}

try {
  const automationIndex = JSON.parse(fs.readFileSync(path.join(root, 'packages/automation/automation.index.json'), 'utf8'));
  if (!Array.isArray(automationIndex.capabilities) || automationIndex.capabilities.length < 8) {
    console.error('Automation index has invalid capability list');
    failed = true;
  }
  if (!Array.isArray(automationIndex.commands) || automationIndex.commands.length < 8) {
    console.error('Automation index has invalid command list');
    failed = true;
  }
} catch {
  console.error('Automation index JSON is invalid');
  failed = true;
}

for (const scriptName of ['automation:init', 'automation:status', 'backlog:add', 'backlog:list', 'sprint:plan', 'task:queue', 'github:issue', 'codex:task', 'release:checklist', 'docs:update', 'automation:report', 'council:automation']) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.error(`package.json missing script: ${scriptName}`);
    failed = true;
  }
}


// Phase 15: Security, Permissions + Governance validation
const governanceRequired = [
  'packages/governance',
  'packages/governance/README.md',
  'packages/governance/GOVERNANCE.md',
  'packages/governance/governance.index.json',
  'packages/governance/governance.schema.json',
  'packages/governance/permission.schema.json',
  'packages/governance/approval.schema.json',
  'packages/governance/audit.schema.json',
  'packages/governance/threat.schema.json',
  'packages/governance/finance-trading.schema.json',
  'packages/governance/policies/permission-model.md',
  'packages/governance/policies/approval-gates.md',
  'packages/governance/policies/risky-actions-policy.md',
  'packages/governance/policies/secrets-policy.md',
  'packages/governance/policies/prompt-injection-defense.md',
  'packages/governance/policies/data-classification-policy.md',
  'packages/governance/policies/tool-permissions-policy.md',
  'packages/governance/policies/provider-governance-policy.md',
  'packages/governance/policies/trading-finance-governance.md',
  'packages/governance/policies/human-approval-policy.md',
  'packages/governance/policies/audit-log-policy.md',
  'packages/governance/policies/governance-escalation-policy.md',
  'packages/governance/permissions/permission-matrix.md',
  'packages/governance/permissions/roles.md',
  'packages/governance/permissions/actions.md',
  'packages/governance/permissions/environments.md',
  'packages/governance/approvals/approval-matrix.md',
  'packages/governance/approvals/approval-workflow.md',
  'packages/governance/approvals/emergency-stop.md',
  'packages/governance/approvals/request-template.md',
  'packages/governance/security/threat-model.md',
  'packages/governance/security/prompt-injection.md',
  'packages/governance/security/secrets-handling.md',
  'packages/governance/security/data-privacy.md',
  'packages/governance/security/tool-sandboxing.md',
  'packages/governance/finance-trading/suitability-boundary.md',
  'packages/governance/finance-trading/risk-disclaimer.md',
  'packages/governance/finance-trading/no-financial-advice.md',
  'packages/governance/finance-trading/trading-system-controls.md',
  'packages/governance/finance-trading/trade-review-gate.md',
  'packages/governance/guards/guardrails.md',
  'packages/governance/guards/restricted-actions.md',
  'packages/governance/guards/refusal-and-escalation-patterns.md',
  'packages/governance/templates/APPROVAL_REQUEST.md',
  'packages/governance/templates/GOVERNANCE_REVIEW.md',
  'packages/governance/templates/SECURITY_REVIEW.md',
  'packages/governance/templates/INCIDENT_ESCALATION.md',
  'packages/governance/templates/AUDIT_RECORD.md',
  'packages/governance/templates/SECRETS_SCAN_REPORT.md',
  'packages/governance/templates/PROMPT_INJECTION_REVIEW.md',
  'packages/governance/templates/TRADING_RISK_APPROVAL.md',
  'packages/governance/checklists/security-preflight.checklist.md',
  'packages/governance/checklists/permission-check.checklist.md',
  'packages/governance/checklists/risky-action.checklist.md',
  'packages/governance/checklists/prompt-injection.checklist.md',
  'packages/governance/checklists/secrets.checklist.md',
  'packages/governance/checklists/trading-finance.checklist.md',
  'packages/governance/checklists/release-governance.checklist.md',
  'storage/governance',
  'storage/governance/audit',
  'storage/governance/approvals',
  'storage/governance/security-reviews',
  'storage/governance/secrets-scans',
  'storage/governance/prompt-injection-reviews',
  'storage/governance/trading-finance-reviews',
  'storage/governance/reports',
  'storage/governance/incidents',
  'storage/governance/permissions',
  'docs/governance-security-system.md',
  'docs/codex-governance-guide.md',
  'docs/specs/governance-spec.md',
  'docs/phase-15-security-permissions-governance.md',
  'scripts/lib/governance-utils.mjs',
  'scripts/governance-init.mjs',
  'scripts/governance-status.mjs',
  'scripts/permissions-check.mjs',
  'scripts/approvals-request.mjs',
  'scripts/approvals-list.mjs',
  'scripts/secrets-scan.mjs',
  'scripts/prompt-injection-check.mjs',
  'scripts/finance-governance-check.mjs',
  'scripts/audit-record.mjs',
  'scripts/governance-report.mjs',
  'scripts/governance-doctor.mjs'
];
for (const rel of governanceRequired) exists(rel);

const governanceCapabilities = dirsWithMarker(path.join(root, 'packages', 'governance', 'capabilities'), 'CAPABILITY.md');
for (const capability of governanceCapabilities) {
  for (const file of ['CAPABILITY.md', 'capability.json', 'prompt.md', 'checklist.md', 'template.md']) {
    if (!fs.existsSync(path.join(root, 'packages', 'governance', 'capabilities', capability, file))) {
      console.error(`Governance capability ${capability} missing ${file}`);
      failed = true;
    }
  }
  const manifestPath = path.join(root, 'packages', 'governance', 'capabilities', capability, 'capability.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const valid = manifest.name && manifest.title && manifest.entrypoint && manifest.category &&
        manifest.riskLevel && typeof manifest.approvalRequired === 'boolean' &&
        Array.isArray(manifest.inputs) && Array.isArray(manifest.outputs) && Array.isArray(manifest.keywords);
      if (!valid) {
        console.error(`Governance capability ${capability} has invalid manifest shape`);
        failed = true;
      }
    } catch {
      console.error(`Governance capability ${capability} has invalid JSON manifest`);
      failed = true;
    }
  }
}
if (governanceCapabilities.length < 10) {
  console.error(`Expected at least 10 governance capabilities, found ${governanceCapabilities.length}`);
  failed = true;
}

try {
  const governanceIndex = JSON.parse(fs.readFileSync(path.join(root, 'packages/governance/governance.index.json'), 'utf8'));
  if (!Array.isArray(governanceIndex.capabilities) || governanceIndex.capabilities.length < 10) {
    console.error('Governance index has invalid capability list');
    failed = true;
  }
  if (!Array.isArray(governanceIndex.commands) || governanceIndex.commands.length < 10) {
    console.error('Governance index has invalid command list');
    failed = true;
  }
} catch {
  console.error('Governance index JSON is invalid');
  failed = true;
}

for (const scriptName of ['governance:init', 'governance:status', 'permissions:check', 'approvals:request', 'approvals:list', 'secrets:scan', 'prompt-injection:check', 'finance:governance', 'audit:record', 'governance:report', 'governance:doctor', 'council:governance']) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.error(`package.json missing script: ${scriptName}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`Knowledge validation passed. Skills: ${skillNames.length}. Senior agents: ${agentNames.length}. Decision engines: ${engineNames.length}. Workflows: ${workflowNames.length}. Templates: ${templateNames.length}. Eval suites: ${evalSuiteNames.length}. Quality gates: ${qualityGateNames.length}. Providers: ${providerNames.length}. Tool contracts: ${toolContractNames.length}. Observability: enabled. Web console: enabled. Project packs: ${projectPackNames.length}. Automation capabilities: ${automationCapabilities.length}. Governance capabilities: ${governanceCapabilities.length}. Memory runtime: enabled.`);
