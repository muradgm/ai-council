import type { AIProvider } from "../../provider-interface.js";
import { callGeminiGenerateContent } from "../http-provider-utils.js";

export const geminiFreeProvider: AIProvider = {
  id: "gemini-free", tier: "freemium", displayName: "Gemini Free Tier", supports: ["general", "coding", "planning"],
  async call(request) {
    return callGeminiGenerateContent(request, {
      provider: "gemini-free",
      envKey: "GEMINI_API_KEY",
      modelEnvKey: "GEMINI_FREE_MODEL",
      defaultModel: "gemini-2.5-flash",
      endpointEnvKey: "GEMINI_API_BASE_URL",
      defaultEndpoint: "https://generativelanguage.googleapis.com",
      confidence: 0.72,
      costEstimateUsd: 0
    });
  }
};
