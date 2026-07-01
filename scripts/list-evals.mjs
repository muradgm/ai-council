#!/usr/bin/env node
import { loadManifestCollection } from './lib/council-utils.mjs';
const suites = loadManifestCollection({ rel: 'packages/evals/suites', marker: 'SUITE.md', manifest: 'suite.json' });
console.log(`Eval suites: ${suites.length}`);
for (const suite of suites) {
  console.log(`- ${suite.id} — ${suite.title || suite.name} [${suite.category || 'uncategorized'}] threshold=${suite.threshold ?? 'n/a'}`);
}
