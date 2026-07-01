import type { AIProvider } from "../../provider-interface.js";
export const openrouterProvider: AIProvider = {
  id: "openrouter", tier: "freemium", displayName: "OpenRouter Low Cost", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "openrouter", model: "openrouter-placeholder", confidence: 0.7, costEstimateUsd: 0.01, text: `[$freemium/OpenRouter Low Cost placeholder]\n\n${request.prompt}` }; }
};
