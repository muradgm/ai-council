import type { AIProvider } from "../../provider-interface.js";
import { callGeminiGenerateContent } from "../http-provider-utils.js";

export const geminiProProvider: AIProvider = {
  id: "gemini-pro", tier: "premium", displayName: "Gemini Pro", supports: ["general", "coding", "planning"],
  async call(request) {
    return callGeminiGenerateContent(request, {
      provider: "gemini-pro",
      envKey: "GEMINI_API_KEY",
      modelEnvKey: "GEMINI_PRO_MODEL",
      defaultModel: "gemini-2.5-pro",
      endpointEnvKey: "GEMINI_API_BASE_URL",
      defaultEndpoint: "https://generativelanguage.googleapis.com",
      confidence: 0.86,
      costEstimateUsd: 0.08
    });
  }
};
