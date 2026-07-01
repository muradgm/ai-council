import type { AIProvider } from "../../provider-interface.js";
export const grokProvider: AIProvider = {
  id: "grok", tier: "freemium", displayName: "Grok / xAI", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "grok", model: "grok-placeholder", confidence: 0.7, costEstimateUsd: 0.02, text: `[$freemium/Grok / xAI placeholder]\n\n${request.prompt}` }; }
};
