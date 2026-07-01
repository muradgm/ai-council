#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { nowIso, root, writeJson, writeText } from './lib/council-utils.mjs';

const feedbackDir = path.join(root, 'storage/learning/feedback');

function loadFeedback() {
  if (!fs.existsSync(feedbackDir)) return [];
  return fs.readdirSync(feedbackDir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      try {
        return JSON.parse(fs.readFileSync(path.join(feedbackDir, file), 'utf8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function dimensionCounts(records) {
  const counts = {};
  for (const record of records) {
    for (const dimension of record.dimensions || ['uncategorized']) {
      counts[dimension] = (counts[dimension] || 0) + 1;
    }
  }
  return counts;
}

function proposalForDimension(dimension) {
  const proposals = {
    accuracy: 'Add an eval case that checks factual claims against cited repo files before accepting output.',
    specificity: 'Strengthen prompts to require file paths, concrete commands, and explicit next actions.',
    grounding: 'Require runtime context packs and source references for architecture, review, and implementation outputs.',
    'language-quality': 'Create a response-style rubric covering clarity, concision, tone, and over/under-explanation.',
    safety: 'Route high-risk feedback through governance and add safety-boundary checks to response evals.',
    usefulness: 'Add acceptance criteria that every recommendation names owner, command, or next concrete action.',
    'general-quality': 'Review feedback manually and decide whether it maps to a prompt, eval, docs, or runtime fix.',
    'positive-pattern': 'Preserve the behavior as a positive example if it is repeatable and grounded.'
  };
  return proposals[dimension] || proposals['general-quality'];
}

const records = loadFeedback();
const counts = dimensionCounts(records);
const open = records.filter(record => record.status !== 'resolved');
const averageRating = records.length
  ? Number((records.reduce((sum, record) => sum + Number(record.rating || 0), 0) / records.length).toFixed(2))
  : null;

const proposals = Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .map(([dimension, count]) => ({
    dimension,
    count,
    proposal: proposalForDimension(dimension),
    requiresHumanReview: true
  }));

const report = {
  generatedAt: nowIso(),
  feedbackCount: records.length,
  openCount: open.length,
  averageRating,
  dimensionCounts: counts,
  proposals,
  policy: {
    silentSelfModification: false,
    allowedActions: ['propose eval cases', 'propose prompt changes', 'propose docs changes', 'propose runtime fixes'],
    requiredBeforeBehaviorChange: ['human review', 'passing evals', 'final validation']
  }
};

writeJson('storage/learning/latest-learning-report.json', report);

const proposalLines = proposals.length
  ? proposals.map(item => `- ${item.dimension} (${item.count}): ${item.proposal}`).join('\n')
  : '- No feedback yet.';

const recentLines = records.slice(0, 10).map(record => `- ${record.createdAt} | ${record.project} | ${record.rating}/5 | ${(record.dimensions || []).join(', ')} | ${record.feedback}`).join('\n') || '- No feedback yet.';

const md = `# AI Council Learning Report\n\nGenerated: ${report.generatedAt}\n\n## Summary\n\n- Feedback records: ${report.feedbackCount}\n- Open records: ${report.openCount}\n- Average rating: ${averageRating ?? 'n/a'}\n\n## Dimension Counts\n\n${Object.entries(counts).map(([key, value]) => `- ${key}: ${value}`).join('\n') || '- None'}\n\n## Proposed Improvements\n\n${proposalLines}\n\n## Recent Feedback\n\n${recentLines}\n\n## Safety Policy\n\nThe learning loop may propose prompt, eval, documentation, and runtime changes. It must not silently modify production behavior. Human review, passing evals, and final validation are required before behavior changes.\n`;

writeText('storage/learning/latest-learning-report.md', md);

console.log('Learning report generated: storage/learning/latest-learning-report.md');
console.log(`Feedback records: ${records.length}`);
console.log(`Average rating: ${averageRating ?? 'n/a'}`);
