import type { AIProvider } from "../../provider-interface.js";
export const lmstudioProvider: AIProvider = {
  id: "lmstudio", tier: "local", displayName: "LM Studio", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "lmstudio", model: "lmstudio-placeholder", confidence: 0.6, costEstimateUsd: 0, text: `[$local/LM Studio placeholder]\n\n${request.prompt}` }; }
};
