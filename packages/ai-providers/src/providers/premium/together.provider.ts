import type { AIProvider } from "../../provider-interface.js";
export const togetherProvider: AIProvider = {
  id: "together", tier: "premium", displayName: "Together AI", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "together", model: "together-placeholder", confidence: 0.8, costEstimateUsd: 0.04, text: `[$premium/Together AI placeholder]\n\n${request.prompt}` }; }
};
