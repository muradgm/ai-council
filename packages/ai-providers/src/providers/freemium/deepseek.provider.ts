import type { AIProvider } from "../../provider-interface.js";
export const deepseekProvider: AIProvider = {
  id: "deepseek", tier: "freemium", displayName: "DeepSeek", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "deepseek", model: "deepseek-placeholder", confidence: 0.75, costEstimateUsd: 0.01, text: `[$freemium/DeepSeek placeholder]\n\n${request.prompt}` }; }
};
