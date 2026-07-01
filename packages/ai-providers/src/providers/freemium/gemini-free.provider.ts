import type { AIProvider } from "../../provider-interface.js";
export const geminiFreeProvider: AIProvider = {
  id: "gemini-free", tier: "freemium", displayName: "Gemini Free Tier", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "gemini-free", model: "gemini-free-placeholder", confidence: 0.72, costEstimateUsd: 0, text: `[$freemium/Gemini Free Tier placeholder]\n\n${request.prompt}` }; }
};
