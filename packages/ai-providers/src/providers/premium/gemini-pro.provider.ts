import type { AIProvider } from "../../provider-interface.js";
export const geminiProProvider: AIProvider = {
  id: "gemini-pro", tier: "premium", displayName: "Gemini Pro", supports: ["general", "coding", "planning"],
  async call(request) { return { provider: "gemini-pro", model: "gemini-pro-placeholder", confidence: 0.86, costEstimateUsd: 0.08, text: `[$premium/Gemini Pro placeholder]\n\n${request.prompt}` }; }
};
