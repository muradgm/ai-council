#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const index = JSON.parse(fs.readFileSync(path.join(root, 'packages/ai-providers/providers.index.json'), 'utf8'));
const keys = [...new Set(index.providers.flatMap(p => p.env || []))].sort();
const modelKeys = [
  'OPENAI_MODEL',
  'GEMINI_FREE_MODEL',
  'GEMINI_PRO_MODEL',
  'DEEPSEEK_MODEL',
  'XAI_MODEL',
  'MISTRAL_MODEL',
  'OLLAMA_MODEL'
].sort();
console.log('# AI Council provider environment');
for (const key of keys) console.log(`${key}=`);
console.log('\n# Optional model overrides');
for (const key of modelKeys) console.log(`${key}=`);
