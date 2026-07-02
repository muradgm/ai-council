import type { AIProvider } from "../../provider-interface.js";
import { callOpenAICompatible } from "../http-provider-utils.js";

export const mistralProvider: AIProvider = {
  id: "mistral", tier: "freemium", displayName: "Mistral", supports: ["general", "coding", "planning"],
  async call(request) {
    return callOpenAICompatible(request, {
      provider: "mistral",
      envKey: "MISTRAL_API_KEY",
      modelEnvKey: "MISTRAL_MODEL",
      defaultModel: "mistral-large-latest",
      endpointEnvKey: "MISTRAL_CHAT_COMPLETIONS_URL",
      defaultEndpoint: "https://api.mistral.ai/v1/chat/completions",
      confidence: 0.7,
      costEstimateUsd: 0.01
    });
  }
};
