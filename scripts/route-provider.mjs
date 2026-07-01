#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const request = process.argv.slice(2).join(' ') || '';
const text = request.toLowerCase();
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/ai-providers/providers.index.json'), 'utf8'));
function pick() {
  if (/secret|token|credential|private repo|local|offline/.test(text)) return ['ollama','lmstudio','llamacpp'];
  if (/security|architecture|critical|risk|forex|trading|finance|legal|medical/.test(text)) return ['openai','anthropic','gemini-pro'];
  if (/code|coding|bug|refactor|typescript|react|node/.test(text)) return ['deepseek','ollama','openrouter'];
  if (/cheap|free|cost|budget/.test(text)) return ['gemini-free','deepseek','mistral'];
  return ['ollama','gemini-free','openai'];
}
const selected = pick().map(id => index.providers.find(p => p.id === id)).filter(Boolean);
console.log(`Provider route for: ${request || '(empty request)'}`);
for (const p of selected) console.log(`- ${p.id} (${p.tier}) — ${p.name}`);
console.log('\nPolicy notes:');
if (/secret|token|credential|private/.test(text)) console.log('- local-only recommended; do not upload context externally.');
if (/trading|forex|finance/.test(text)) console.log('- high-risk finance/trading output must pass risk and disclaimer gates.');
if (/security|critical/.test(text)) console.log('- premium model plus human review recommended.');
if (!/secret|token|credential|private|trading|forex|finance|security|critical/.test(text)) console.log('- default local/freemium-first route; escalate only if quality gates fail.');
