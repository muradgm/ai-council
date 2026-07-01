import type { AIProvider } from "../../provider-interface.js";
export const openaiProvider: AIProvider = {
  id: "openai", tier: "premium", displayName: "OpenAI", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "openai", model: "premium-placeholder", confidence: 0.9, costEstimateUsd: 0.1, text: `[$premium/OpenAI placeholder]\n\n${request.prompt}` }; }
};
