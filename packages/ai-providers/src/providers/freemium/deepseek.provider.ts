import type { AIProvider } from "../../provider-interface.js";
import { callOpenAICompatible } from "../http-provider-utils.js";

export const deepseekProvider: AIProvider = {
  id: "deepseek", tier: "freemium", displayName: "DeepSeek", supports: ["general", "coding", "planning"],
  async call(request) {
    return callOpenAICompatible(request, {
      provider: "deepseek",
      envKey: "DEEPSEEK_API_KEY",
      modelEnvKey: "DEEPSEEK_MODEL",
      defaultModel: "deepseek-chat",
      endpointEnvKey: "DEEPSEEK_CHAT_COMPLETIONS_URL",
      defaultEndpoint: "https://api.deepseek.com/chat/completions",
      confidence: 0.75,
      costEstimateUsd: 0.01
    });
  }
};
