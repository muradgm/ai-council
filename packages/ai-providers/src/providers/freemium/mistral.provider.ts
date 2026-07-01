import type { AIProvider } from "../../provider-interface.js";
export const mistralProvider: AIProvider = {
  id: "mistral", tier: "freemium", displayName: "Mistral", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "mistral", model: "mistral-placeholder", confidence: 0.7, costEstimateUsd: 0.01, text: `[$freemium/Mistral placeholder]\n\n${request.prompt}` }; }
};
