import { ModelBackedAgent } from "../base/model-backed-agent.js";

export class SecurityArchitectAgent extends ModelBackedAgent {
  constructor() {
    super({
      id: "security-architect",
      role: "security architect",
      instructionPath: "packages/ai-core/src/agents/core/security-architect.spec.md",
      focus: ["privacy boundaries", "provider/tool permissions", "secret handling", "local API attack surface", "approval gates"]
    });
  }
}
