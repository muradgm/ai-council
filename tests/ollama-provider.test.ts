import assert from "node:assert/strict";
import { ollamaProvider } from "../packages/ai-providers/src/providers/local/ollama.provider.js";

const result = await ollamaProvider.call({
  prompt: "How do I start Ollama locally?",
  privacyLevel: "local-only"
});

assert.ok(result.text.toLowerCase().includes("ollama serve") || result.text.toLowerCase().includes("install"), result.text);
console.log("Ollama guidance fallback passed.");
