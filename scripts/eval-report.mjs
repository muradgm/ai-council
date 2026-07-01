#!/usr/bin/env node
import { readText } from './lib/council-utils.mjs';
const report = readText('storage/evals/latest-eval-report.md', 'No eval report found. Run: pnpm evals:run');
console.log(report);
