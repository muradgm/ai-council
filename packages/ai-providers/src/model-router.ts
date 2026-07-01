import type { CouncilRequest } from "../../shared/src/index.js";
import { ProviderRegistry } from "./provider-registry.js";
import { PrivacyEngine } from "./privacy-engine.js";
export class ModelRouter {
  constructor(private readonly registry = new ProviderRegistry(), private readonly privacy = new PrivacyEngine()) {}
  selectProvider(request: CouncilRequest) {
    const risk = request.riskLevel ?? "low";
    const privacy = this.privacy.resolvePrivacy(request);
    if (privacy === "local-only") return this.registry.get("ollama")!;
    if (risk === "critical" || risk === "high") return this.registry.get("openai")!;
    if (request.taskType?.includes("coding")) return this.registry.get("deepseek")!;
    return this.registry.get("gemini-free")!;
  }
}
