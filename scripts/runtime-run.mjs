#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { nowIso, readText, root, writeJson, writeText } from './lib/council-utils.mjs';

const [project = 'general', ...taskParts] = process.argv.slice(2);
const task = taskParts.join(' ').trim() || 'Run a grounded Council review.';

function runScript(script, args = []) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script), ...args], {
    cwd: root,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${script} failed${output ? `\n${output}` : ''}`);
  }
  return result.stdout.trim();
}

function ensureContext() {
  if (!fs.existsSync(path.join(root, 'storage/runtime/repo-index.json'))) {
    runScript('runtime-index.mjs');
  }
  runScript('runtime-context.mjs', [project, task]);
  return JSON.parse(fs.readFileSync(path.join(root, 'storage/runtime/cache/latest-runtime-context.json'), 'utf8'));
}

function readSections(readSet) {
  return readSet.map(rel => {
    const text = readText(rel).slice(0, 2500);
    return { rel, text };
  });
}

function firstHeading(text) {
  const line = text.split(/\r?\n/).find(item => item.startsWith('# '));
  return line ? line.replace(/^#\s+/, '').trim() : null;
}

function extractPurpose(text) {
  const purposeIndex = text.toLowerCase().indexOf('## purpose');
  if (purposeIndex >= 0) {
    return text.slice(purposeIndex).split(/\r?\n\r?\n/)[1]?.trim()?.slice(0, 300) || null;
  }
  const wedgeIndex = text.toLowerCase().indexOf('## wedge');
  if (wedgeIndex >= 0) {
    return text.slice(wedgeIndex).split(/\r?\n\r?\n/)[1]?.trim()?.slice(0, 300) || null;
  }
  return null;
}

function extractSection(text, heading) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex(line => line.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (start < 0) return null;
  const collected = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\s*##\s+/.test(line)) break;
    if (line.trim()) collected.push(line.trim());
  }
  return collected.join(' ').slice(0, 450) || null;
}

function bullet(text, citation) {
  return `- ${text} (${citation})`;
}

function cite(rel) {
  return `\`${rel}\``;
}

function deterministicSynthesis(context, sections, providerResult) {
  const facts = sections
    .map(section => ({
      rel: section.rel,
      title: firstHeading(section.text),
      purpose: extractPurpose(section.text)
    }))
    .filter(item => item.title || item.purpose)
    .slice(0, 8);

  const assetLines = [
    `Workflow: ${context.recommendedWorkflow || 'No strong match'}`,
    `Engine: ${context.recommendedEngine || 'No strong match'}`,
    `Agents: ${(context.recommendedAgents || []).join(', ') || 'No strong match'}`,
    `Skills: ${(context.recommendedSkills || []).join(', ') || 'No strong match'}`
  ];

  const factLines = facts.length
    ? facts.map(item => `- ${item.rel}: ${item.title || item.purpose}`).join('\n')
    : '- No headings or purpose statements were extracted from the read set.';

  const byRel = Object.fromEntries(sections.map(section => [section.rel, section.text]));
  const projectDoc = context.readSet.find(rel => /projects\/.*\/PROJECT\.md/i.test(rel));
  const packDoc = context.readSet.find(rel => /PROJECT_PACK\.md$/i.test(rel));
  const workflowDoc = context.readSet.find(rel => /packages\/workflows\/.*\/WORKFLOW\.md/i.test(rel));
  const engineDoc = context.readSet.find(rel => /packages\/decision-engines\/.*\/ENGINE\.md/i.test(rel));
  const memoryDoc = context.readSet.find(rel => /project-context\.md$/i.test(rel));

  const purpose = projectDoc ? extractSection(byRel[projectDoc] || '', 'Purpose') : null;
  const wedge = packDoc ? extractSection(byRel[packDoc] || '', 'Wedge') : null;
  const workflowPurpose = workflowDoc ? extractSection(byRel[workflowDoc] || '', 'Purpose') : null;
  const enginePurpose = engineDoc ? extractSection(byRel[engineDoc] || '', 'Purpose') : null;
  const memoryHeading = memoryDoc ? firstHeading(byRel[memoryDoc] || '') : null;

  const observations = [
    purpose && bullet(`The active project purpose is ${purpose}`, cite(projectDoc)),
    wedge && bullet(`The project-pack wedge is ${wedge}`, cite(packDoc)),
    workflowPurpose && bullet(`The selected workflow is appropriate because it is meant to ${workflowPurpose}`, cite(workflowDoc)),
    enginePurpose && bullet(`The selected decision engine frames the main tradeoff because it is meant to ${enginePurpose}`, cite(engineDoc)),
    memoryHeading && bullet(`Project memory is available and should be treated as advisory context, not stronger than source files`, cite(memoryDoc))
  ].filter(Boolean);

  const risks = [
    providerResult.available
      ? bullet('Model output was generated locally, but it still needs human review before behavior changes.', cite('packages/ai-providers/src/providers/local/ollama.provider.ts'))
      : bullet('Ollama was unavailable, so model-backed reasoning did not run; deterministic synthesis is useful for grounding but not a substitute for expert review.', cite('packages/ai-providers/src/providers/local/ollama.provider.ts')),
    bullet('Runtime routing can still over-select adjacent assets, so selected workflow, engine, agents, and skills should be reviewed before implementation.', cite('scripts/runtime-context.mjs')),
    bullet('The runtime loop now writes traces and memory, so repeated low-quality outputs should be converted into learning feedback and eval cases.', cite('storage/learning/README.md'))
  ];

  const nextActions = [
    `Review the selected workflow \`${context.recommendedWorkflow || 'unknown'}\` and engine \`${context.recommendedEngine || 'unknown'}\` before implementation.`,
    'Run `pnpm runtime:eval` after runtime execution reports are produced.',
    `Capture response-quality feedback with \`pnpm learning:feedback ${context.project} <1-5> "..." \`.`,
    providerResult.available ? 'Use the local model synthesis as draft reasoning, then verify file citations.' : 'Start Ollama locally and rerun for model-backed synthesis when deeper reasoning is required.'
  ];

  const providerBlock = providerResult.available
    ? `## Local Model Synthesis\n\n${providerResult.text.trim()}`
    : `## Local Model Synthesis\n\nOllama was not available, so this run used deterministic repo-grounded synthesis. Start Ollama and rerun for model-backed analysis.\n\nProvider warning: ${providerResult.warning || 'not available'}`;

  return `# Runtime Execution Report\n\nGenerated: ${nowIso()}\n\n## Verdict\n\nRuntime loop completed. Output is grounded in selected repository files, local provider execution was attempted, and review artifacts were persisted.\n\n## Project\n\n${context.project}\n\n## Task\n\n${context.task}\n\n## Selected Runtime Assets\n\n${assetLines.map(line => `- ${line}`).join('\n')}\n\n## Grounding Files\n\n${context.readSet.map(rel => `- ${rel}`).join('\n')}\n\n## Grounded Observations\n\n${observations.length ? observations.join('\n') : factLines}\n\n## Extracted Grounding Facts\n\n${factLines}\n\n${providerBlock}\n\n## Risks And Limits\n\n${risks.join('\n')}\n\n## Runtime Decision\n\nThis run completed the first grounded Council loop: project/task context was indexed, selected assets were loaded, local provider execution was attempted, and artifacts were written for review. The output should be treated as a review artifact, not an automatic implementation decision.\n\n## Validation To Run\n\n${(context.validation || []).map(command => `- \`${command}\``).join('\n')}\n\n## Next Actions\n\n${nextActions.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n`;
}

async function callOllama(prompt) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
  const model = process.env.OLLAMA_MODEL || 'llama3.1';
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 20_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: controller.signal
    });
    if (!response.ok) {
      return { available: false, provider: 'ollama', model, warning: `HTTP ${response.status} ${response.statusText}`, text: '' };
    }
    const data = await response.json();
    return { available: Boolean(data.response), provider: 'ollama', model: data.model || model, warning: '', text: data.response || '' };
  } catch (error) {
    return { available: false, provider: 'ollama', model, warning: error instanceof Error ? error.message : String(error), text: '' };
  } finally {
    clearTimeout(timeout);
  }
}

function writeRunTrace({ id, timestamp, context, artifactRel, providerResult }) {
  const record = {
    id,
    timestamp,
    project: context.project,
    task: context.task,
    status: 'completed',
    summary: 'Grounded runtime execution loop completed.',
    agents: context.recommendedAgents || [],
    skills: context.recommendedSkills || [],
    engines: context.recommendedEngine ? [context.recommendedEngine] : [],
    workflows: context.recommendedWorkflow ? [context.recommendedWorkflow] : [],
    templates: [],
    artifacts: [artifactRel],
    validations: context.validation || [],
    risks: providerResult.available ? [] : ['Ollama unavailable; deterministic synthesis used.'],
    nextActions: ['Review artifact.', 'Capture learning feedback.', 'Run with Ollama available for model-backed synthesis.']
  };
  writeJson(`storage/observability/runs/${id}.json`, record);
}

function writeProviderTrace({ id, timestamp, providerResult }) {
  const record = {
    id: `provider-${id}`,
    timestamp,
    provider: providerResult.provider,
    model: providerResult.model,
    purpose: 'runtime execution loop',
    tier: 'local',
    estimatedCost: 0,
    redaction: 'repo-context-local',
    status: providerResult.available ? 'completed' : 'unavailable',
    warning: providerResult.warning || null
  };
  const rel = `storage/observability/provider-calls/${record.id}.json`;
  writeJson(rel, record);
  return rel;
}

function writeSessionSummary({ timestamp, context, artifactRel, providerRel, providerResult }) {
  const stamp = timestamp.replace(/[:.]/g, '-');
  const body = `# Session Summary\n\n## Date\n\n${timestamp.slice(0, 10)}\n\n## Project\n\n${context.project}\n\n## User goal\n\n${context.task}\n\n## Work completed\n\n- Generated runtime index/context.\n- Loaded selected workflow, engine, agents, skills, and project context.\n- Attempted local Ollama provider execution.\n- Wrote runtime execution artifact and observability traces.\n\n## Files changed\n\n- ${artifactRel}\n- storage/observability/runs/runtime-${stamp}.json\n- ${providerRel}\n\n## Decisions made\n\n- Use local-first runtime execution.\n- Use deterministic grounded synthesis when Ollama is unavailable.\n\n## Blockers\n\n${providerResult.available ? '- None recorded.' : '- Ollama was unavailable for model-backed synthesis.'}\n\n## Next actions\n\n- Review the runtime artifact.\n- Capture learning feedback.\n- Rerun with Ollama available when model-backed output is required.\n\n## Context to carry forward\n\nRuntime loop is now executable and trace-producing.\n`;
  writeText(`storage/memory/sessions/${context.project}/${stamp}.runtime-session.md`, body);
}

const context = ensureContext();
const sections = readSections(context.readSet || []);
const prompt = [
  'You are AI Council running a grounded local runtime execution loop.',
  `Project: ${context.project}`,
  `Task: ${context.task}`,
  `Workflow: ${context.recommendedWorkflow || 'none'}`,
  `Engine: ${context.recommendedEngine || 'none'}`,
  `Agents: ${(context.recommendedAgents || []).join(', ')}`,
  '',
  'Use only the supplied context. Be concise, cite file paths, and recommend concrete next actions.',
  '',
  sections.map(section => `### ${section.rel}\n${section.text}`).join('\n\n')
].join('\n\n');

const providerResult = await callOllama(prompt);
const report = deterministicSynthesis(context, sections, providerResult);
const timestamp = nowIso();
const id = `runtime-${timestamp.replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
const artifactRel = `storage/runtime/runs/${id}.md`;

writeText(artifactRel, report);
writeJson(`storage/runtime/runs/${id}.json`, {
  id,
  timestamp,
  project: context.project,
  task: context.task,
  artifactRel,
  contextCacheKey: context.cacheKey,
  provider: providerResult
});
writeRunTrace({ id, timestamp, context, artifactRel, providerResult });
const providerRel = writeProviderTrace({ id, timestamp, providerResult });
writeSessionSummary({ timestamp, context, artifactRel, providerRel, providerResult });

console.log(`Runtime run completed: ${artifactRel}`);
console.log(`Provider: ${providerResult.provider}/${providerResult.model} (${providerResult.available ? 'available' : 'unavailable'})`);
