import type { CouncilRequest } from "../../shared/src/index.js";
import { ProviderRegistry } from "./provider-registry.js";
import { PrivacyEngine } from "./privacy-engine.js";
export class ModelRouter {
  constructor(private readonly registry = new ProviderRegistry(), private readonly privacy = new PrivacyEngine()) {}

  private configured(id: string) {
    const envByProvider: Record<string, string[]> = {
      openai: ["OPENAI_API_KEY"],
      "gemini-pro": ["GEMINI_API_KEY"],
      "gemini-free": ["GEMINI_API_KEY"],
      deepseek: ["DEEPSEEK_API_KEY"],
      grok: ["XAI_API_KEY"],
      mistral: ["MISTRAL_API_KEY"],
      openrouter: ["OPENROUTER_API_KEY"],
      together: ["TOGETHER_API_KEY"],
      anthropic: ["ANTHROPIC_API_KEY"]
    };
    const env = envByProvider[id] || [];
    return env.length === 0 || env.some(name => Boolean(process.env[name]));
  }

  private firstAvailable(ids: string[]) {
    const id = ids.find(candidate => this.configured(candidate));
    return id ? this.registry.get(id) : undefined;
  }

  selectProvider(request: CouncilRequest) {
    const risk = request.riskLevel ?? "low";
    const privacy = this.privacy.resolvePrivacy(request);
    if (privacy === "local-only") return this.registry.get("ollama")!;
    if (risk === "critical" || risk === "high") return this.firstAvailable(["openai", "gemini-pro", "anthropic", "ollama"])!;
    if (request.taskType?.includes("coding")) return this.firstAvailable(["deepseek", "mistral", "grok", "gemini-free", "ollama"])!;
    return this.firstAvailable(["gemini-free", "mistral", "grok", "deepseek", "ollama"])!;
  }
}
