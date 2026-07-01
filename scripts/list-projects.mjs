#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { listDirs, root } from './lib/council-utils.mjs';

const projectDirs = listDirs('projects');
const memoryDirs = listDirs('storage/memory/projects');
const names = Array.from(new Set([...projectDirs, ...memoryDirs])).sort();
console.log('Known AI Council projects');
console.log('-------------------------');
for (const name of names) {
  const p = fs.existsSync(path.join(root, 'projects', name)) ? `projects/${name}` : '';
  const m = fs.existsSync(path.join(root, 'storage/memory/projects', name)) ? `storage/memory/projects/${name}` : '';
  console.log(`- ${name}${p ? ` | ${p}` : ''}${m ? ` | ${m}` : ''}`);
}
