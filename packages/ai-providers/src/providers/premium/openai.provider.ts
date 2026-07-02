import type { AIProvider } from "../../provider-interface.js";
import { callOpenAICompatible } from "../http-provider-utils.js";

export const openaiProvider: AIProvider = {
  id: "openai", tier: "premium", displayName: "OpenAI", supports: ["general", "coding", "planning"],
  async call(request) {
    return callOpenAICompatible(request, {
      provider: "openai",
      envKey: "OPENAI_API_KEY",
      modelEnvKey: "OPENAI_MODEL",
      defaultModel: "gpt-5.4",
      endpointEnvKey: "OPENAI_CHAT_COMPLETIONS_URL",
      defaultEndpoint: "https://api.openai.com/v1/chat/completions",
      confidence: 0.9,
      costEstimateUsd: 0.1
    });
  }
};
