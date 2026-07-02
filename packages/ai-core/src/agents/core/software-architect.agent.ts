import { ModelBackedAgent } from "../base/model-backed-agent.js";

export class SoftwareArchitectAgent extends ModelBackedAgent {
  constructor() {
    super({
      id: "software-architect",
      role: "software architect",
      instructionPath: "packages/ai-core/src/agents/core/software-architect.spec.md",
      focus: ["architecture boundaries", "modularity", "runtime execution path", "tradeoffs", "maintainability"]
    });
  }
}
