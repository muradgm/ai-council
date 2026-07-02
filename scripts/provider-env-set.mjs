#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const allowed = new Set([
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "DEEPSEEK_API_KEY",
  "XAI_API_KEY",
  "MISTRAL_API_KEY",
  "ANTHROPIC_API_KEY",
  "OPENROUTER_API_KEY",
  "TOGETHER_API_KEY"
]);

const [name, value] = process.argv.slice(2);

if (!name || !value || !allowed.has(name)) {
  console.error("Usage: node scripts/provider-env-set.mjs <ENV_NAME> <VALUE>");
  console.error(`Allowed ENV_NAME values: ${[...allowed].join(", ")}`);
  process.exit(1);
}

const result = spawnSync("setx", [name, value], {
  stdio: ["ignore", "ignore", "pipe"],
  encoding: "utf8",
  shell: false
});

if (result.status !== 0) {
  console.error("Failed to update the Windows user environment.");
  console.error(result.stderr || "Unknown setx failure.");
  process.exit(result.status || 1);
}

console.log(`${name} saved to the Windows user environment. Restart shells/dev servers to use it.`);
