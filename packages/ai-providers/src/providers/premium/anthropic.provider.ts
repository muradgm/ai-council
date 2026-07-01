import type { AIProvider } from "../../provider-interface.js";
export const anthropicProvider: AIProvider = {
  id: "anthropic", tier: "premium", displayName: "Anthropic Claude", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "anthropic", model: "claude-placeholder", confidence: 0.88, costEstimateUsd: 0.1, text: `[$premium/Anthropic Claude placeholder]\n\n${request.prompt}` }; }
};
