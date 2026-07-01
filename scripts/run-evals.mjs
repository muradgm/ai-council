#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { root, loadManifestCollection, routeRequest, writeJson, writeText, nowIso } from './lib/council-utils.mjs';

const suites = loadManifestCollection({ rel: 'packages/evals/suites', marker: 'SUITE.md', manifest: 'suite.json' });
const results = [];

function listCaseFiles(suiteId) {
  const dir = path.join(root, 'packages/evals/suites', suiteId, 'cases');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort().map(f => path.join(dir, f));
}

function topIds(items) {
  return new Set((items || []).map(x => x.id));
}

function groupScore(actualItems, expectedItems) {
  if (!expectedItems || expectedItems.length === 0) return 1;
  const actual = topIds(actualItems);
  const hits = expectedItems.filter(x => actual.has(x)).length;
  return hits / expectedItems.length;
}

for (const suite of suites) {
  const cases = listCaseFiles(suite.id).map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
  const caseResults = [];
  for (const testCase of cases) {
    const ranked = routeRequest(testCase.request, 8);
    const scores = {
      agents: groupScore(ranked.agents, testCase.expected?.agents),
      engines: groupScore(ranked.engines, testCase.expected?.engines),
      workflows: groupScore(ranked.workflows, testCase.expected?.workflows),
      skills: groupScore(ranked.skills, testCase.expected?.skills),
      templates: groupScore(ranked.templates, testCase.expected?.templates)
    };
    const avg = Object.values(scores).reduce((a,b)=>a+b,0) / Object.values(scores).length;
    caseResults.push({ id: testCase.id, request: testCase.request, score: Number(avg.toFixed(3)), scores, expected: testCase.expected });
  }
  const suiteScore = caseResults.length ? caseResults.reduce((a,b)=>a+b.score,0) / caseResults.length : 0;
  const threshold = suite.threshold ?? 0.8;
  results.push({ id: suite.id, title: suite.title, threshold, score: Number(suiteScore.toFixed(3)), passed: suiteScore >= threshold, cases: caseResults });
}

const passed = results.filter(r => r.passed).length;
const failed = results.length - passed;
const totalCases = results.reduce((sum, suite) => sum + suite.cases.length, 0);
const averageScore = results.length ? results.reduce((sum, suite) => sum + suite.score, 0) / results.length : 0;
const report = { generatedAt: nowIso(), suiteCount: results.length, caseCount: totalCases, passed, failed, averageScore: Number(averageScore.toFixed(3)), suites: results };
writeJson('storage/evals/latest-eval-report.json', report);

const failures = results.filter(r => !r.passed);
const suiteLines = results.map(r => `- ${r.passed ? 'PASS' : 'FAIL'} — ${r.id}: ${r.score} / threshold ${r.threshold}`).join('\n');
const failureText = failures.length
  ? failures.map(r => {
      const weak = r.cases.filter(c => c.score < r.threshold).map(c => `- ${c.id}: ${c.score} — ${c.request}`).join('\n') || '- No individual weak case listed.';
      return `### ${r.id}\n\nScore: ${r.score}, threshold: ${r.threshold}\n\nWeak cases:\n${weak}`;
    }).join('\n\n')
  : 'No failing suites.';
const md = `# AI Council Eval Report\n\nGenerated: ${report.generatedAt}\n\n## Summary\n\n- Suites: ${report.suiteCount}\n- Cases: ${report.caseCount}\n- Passed suites: ${passed}\n- Failed suites: ${failed}\n- Average score: ${report.averageScore}\n\n## Suite Results\n\n${suiteLines}\n\n## Failures\n\n${failureText}\n`;
writeText('storage/evals/latest-eval-report.md', md);

console.log(`Eval suites: ${results.length}`);
console.log(`Cases: ${totalCases}`);
console.log(`Passed suites: ${passed}`);
console.log(`Failed suites: ${failed}`);
console.log(`Average score: ${report.averageScore}`);
console.log('Saved: storage/evals/latest-eval-report.md');
if (failed > 0) process.exit(1);
