#!/usr/bin/env node
import crypto from 'node:crypto';
import { nowIso, toSlug, writeJson, writeText } from './lib/council-utils.mjs';

const [project = 'general', ratingRaw = '3', ...feedbackParts] = process.argv.slice(2);
const feedback = feedbackParts.join(' ').trim();

if (!feedback) {
  console.error('Usage: pnpm learning:feedback <project> <1-5> "feedback about response quality"');
  process.exit(1);
}

const rating = Math.max(1, Math.min(5, Number.parseInt(ratingRaw, 10) || 3));
const lower = feedback.toLowerCase();

function includesAny(words) {
  return words.some(word => lower.includes(word));
}

const dimensions = [];
if (includesAny(['wrong', 'incorrect', 'hallucinat', 'made up', 'fake'])) dimensions.push('accuracy');
if (includesAny(['generic', 'vague', 'not specific', 'surface'])) dimensions.push('specificity');
if (includesAny(['source', 'evidence', 'ground', 'repo', 'file'])) dimensions.push('grounding');
if (includesAny(['tone', 'language', 'wording', 'too long', 'too short', 'style'])) dimensions.push('language-quality');
if (includesAny(['unsafe', 'risk', 'security', 'privacy', 'approval'])) dimensions.push('safety');
if (includesAny(['not useful', 'next step', 'actionable', 'practical'])) dimensions.push('usefulness');
if (!dimensions.length) dimensions.push(rating >= 4 ? 'positive-pattern' : 'general-quality');

const id = `feedback-${nowIso().replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
const record = {
  id,
  createdAt: nowIso(),
  project,
  rating,
  dimensions,
  feedback,
  status: 'needs-review',
  policy: 'Feedback may propose prompt, eval, documentation, or runtime changes, but must not silently modify production behavior.'
};

writeJson(`storage/learning/feedback/${id}.json`, record);

const md = `# Learning Feedback\n\nCreated: ${record.createdAt}\n\nProject: ${project}\n\nRating: ${rating}/5\n\nDimensions: ${dimensions.join(', ')}\n\n## Feedback\n\n${feedback}\n\n## Review policy\n\n${record.policy}\n`;
writeText(`storage/learning/feedback/${id}.md`, md);

console.log(`Learning feedback saved: storage/learning/feedback/${id}.json`);
console.log(`Dimensions: ${dimensions.join(', ')}`);
