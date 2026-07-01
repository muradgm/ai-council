import type { AIProvider } from "./provider-interface.js";
import { ollamaProvider } from "./providers/local/ollama.provider.js";
import { lmstudioProvider } from "./providers/local/lmstudio.provider.js";
import { llamacppProvider } from "./providers/local/llamacpp.provider.js";
import { deepseekProvider } from "./providers/freemium/deepseek.provider.js";
import { geminiFreeProvider } from "./providers/freemium/gemini-free.provider.js";
import { grokProvider } from "./providers/freemium/grok.provider.js";
import { mistralProvider } from "./providers/freemium/mistral.provider.js";
import { openrouterProvider } from "./providers/freemium/openrouter.provider.js";
import { openaiProvider } from "./providers/premium/openai.provider.js";
import { anthropicProvider } from "./providers/premium/anthropic.provider.js";
import { geminiProProvider } from "./providers/premium/gemini-pro.provider.js";
import { togetherProvider } from "./providers/premium/together.provider.js";
export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  constructor() { [ollamaProvider,lmstudioProvider,llamacppProvider,deepseekProvider,geminiFreeProvider,grokProvider,mistralProvider,openrouterProvider,openaiProvider,anthropicProvider,geminiProProvider,togetherProvider].forEach(p => this.register(p)); }
  register(provider: AIProvider) { this.providers.set(provider.id, provider); }
  get(id: string) { return this.providers.get(id); }
  list() { return [...this.providers.values()]; }
}
