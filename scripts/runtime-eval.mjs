#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { nowIso, root, writeJson, writeText } from './lib/council-utils.mjs';

const [artifactArg] = process.argv.slice(2);
const threshold = 0.8;

function normalizeRel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function latestRuntimeArtifact() {
  const dir = path.join(root, 'storage/runtime/runs');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(dir, file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0] || null;
}

function resolveArtifact() {
  if (!artifactArg) return latestRuntimeArtifact();
  const candidate = path.isAbsolute(artifactArg) ? artifactArg : path.join(root, artifactArg);
  return fs.existsSync(candidate) ? candidate : null;
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function hasSection(text, heading) {
  return new RegExp(`^##\\s+${heading}\\s*$`, 'im').test(text);
}

function uniqueBacktickCitations(text) {
  const matches = [...text.matchAll(/`([^`]+?\.(?:md|ts|mjs|json))`/gi)]
    .map(match => match[1].replaceAll('\\', '/'));
  return [...new Set(matches)];
}

function evaluate(text) {
  const citations = uniqueBacktickCitations(text);
  const numberedActions = countMatches(text, /^\d+\.\s+\S.+$/gm);
  const pnpmCommands = countMatches(text, /`pnpm\s+[^`]+`/g);
  const checks = [
    {
      id: 'runtime-report-title',
      label: 'Runtime report title',
      passed: /^# Runtime Execution Report\s*$/im.test(text),
      weight: 1,
      detail: 'Artifact must identify itself as a runtime execution report.'
    },
    {
      id: 'verdict-section',
      label: 'Verdict section',
      passed: hasSection(text, 'Verdict'),
      weight: 1,
      detail: 'Artifact must include a concise outcome verdict.'
    },
    {
      id: 'grounded-observations',
      label: 'Grounded observations',
      passed: hasSection(text, 'Grounded Observations'),
      weight: 1,
      detail: 'Artifact must include repo-grounded observations.'
    },
    {
      id: 'file-citations',
      label: 'File citations',
      passed: citations.length >= 3,
      weight: 1.5,
      detail: `Found ${citations.length} unique backtick file citations.`
    },
    {
      id: 'no-heading-bleed',
      label: 'Clean extracted sections',
      passed: !/^- .*##\s+/m.test(text),
      weight: 1,
      detail: 'Extracted bullet text should not include raw markdown headings from later sections.'
    },
    {
      id: 'risks-and-limits',
      label: 'Risks and limits',
      passed: hasSection(text, 'Risks And Limits'),
      weight: 1,
      detail: 'Artifact must name limits, uncertainty, or failure modes.'
    },
    {
      id: 'validation-to-run',
      label: 'Validation commands',
      passed: hasSection(text, 'Validation To Run') && pnpmCommands >= 1,
      weight: 1,
      detail: `Found ${pnpmCommands} pnpm command citation(s).`
    },
    {
      id: 'next-actions',
      label: 'Next actions',
      passed: hasSection(text, 'Next Actions') && numberedActions >= 3,
      weight: 1,
      detail: `Found ${numberedActions} numbered action(s).`
    },
    {
      id: 'provider-transparency',
      label: 'Provider transparency',
      passed: hasSection(text, 'Local Model Synthesis') && /Provider warning|Ollama|local model/i.test(text),
      weight: 1,
      detail: 'Artifact must state whether local model synthesis ran or fell back.'
    }
  ];

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.filter(check => check.passed).reduce((sum, check) => sum + check.weight, 0);
  const score = Number((earned / totalWeight).toFixed(3));
  return { score, passed: score >= threshold && checks.every(check => check.weight < 1.5 || check.passed), citations, checks };
}

const artifactPath = resolveArtifact();
if (!artifactPath) {
  console.error('No runtime artifact found. Run `pnpm runtime:run <project> "<task>"` first.');
  process.exit(1);
}

const rel = normalizeRel(artifactPath);
const text = fs.readFileSync(artifactPath, 'utf8');
const result = evaluate(text);
const report = {
  generatedAt: nowIso(),
  artifact: rel,
  threshold,
  score: result.score,
  passed: result.passed,
  citations: result.citations,
  checks: result.checks
};

writeJson('storage/evals/latest-runtime-artifact-report.json', report);

const checkLines = report.checks
  .map(check => `- ${check.passed ? 'PASS' : 'FAIL'} - ${check.label}: ${check.detail}`)
  .join('\n');
const citationLines = report.citations.length
  ? report.citations.map(citation => `- \`${citation}\``).join('\n')
  : '- No file citations detected.';
const md = `# Runtime Artifact Quality Report

Generated: ${report.generatedAt}

## Summary

- Artifact: ${report.artifact}
- Score: ${report.score}
- Threshold: ${report.threshold}
- Result: ${report.passed ? 'PASS' : 'FAIL'}

## Checks

${checkLines}

## Citations

${citationLines}
`;
writeText('storage/evals/latest-runtime-artifact-report.md', md);

console.log(`Runtime artifact: ${rel}`);
console.log(`Runtime artifact score: ${report.score}`);
console.log(`Runtime artifact result: ${report.passed ? 'PASS' : 'FAIL'}`);
console.log('Saved: storage/evals/latest-runtime-artifact-report.md');

if (!report.passed) process.exit(1);
