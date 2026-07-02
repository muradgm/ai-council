import type { AIProvider } from "../../provider-interface.js";
import { callOpenAICompatible } from "../http-provider-utils.js";

export const grokProvider: AIProvider = {
  id: "grok", tier: "freemium", displayName: "Grok / xAI", supports: ["general", "coding", "planning"],
  async call(request) {
    return callOpenAICompatible(request, {
      provider: "grok",
      envKey: "XAI_API_KEY",
      modelEnvKey: "XAI_MODEL",
      defaultModel: "grok-4.3",
      endpointEnvKey: "XAI_CHAT_COMPLETIONS_URL",
      defaultEndpoint: "https://api.x.ai/v1/chat/completions",
      confidence: 0.7,
      costEstimateUsd: 0.02
    });
  }
};
