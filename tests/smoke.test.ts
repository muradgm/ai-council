import assert from "node:assert/strict";
import { Orchestrator } from "../packages/ai-core/src/index.js";
const orchestrator = new Orchestrator();
const result = await orchestrator.run({ input: "Smoke test the AI Council", privacyLevel: "local-only" });
assert.equal(result.selectedProvider, "ollama");
assert.ok(result.answer.includes("Selected council"));
console.log("Smoke test passed.");


import { existsSync } from 'node:fs';

if (!existsSync('packages/workflows/workflows.index.json')) {
  throw new Error('Missing workflows index');
}
