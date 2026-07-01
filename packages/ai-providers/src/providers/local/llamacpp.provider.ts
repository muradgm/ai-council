import type { AIProvider } from "../../provider-interface.js";
export const llamacppProvider: AIProvider = {
  id: "llamacpp", tier: "local", displayName: "llama.cpp", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "llamacpp", model: "llamacpp-placeholder", confidence: 0.58, costEstimateUsd: 0, text: `[$local/llama.cpp placeholder]\n\n${request.prompt}` }; }
};
