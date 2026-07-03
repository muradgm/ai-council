#!/usr/bin/env node
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const tsx = path.join(root, 'node_modules/tsx/dist/cli.mjs');
const cli = path.join(root, 'packages/action-runtime/src/cli.ts');

const result = spawnSync(process.execPath, [tsx, cli, ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit'
});

process.exitCode = result.status ?? 1;
