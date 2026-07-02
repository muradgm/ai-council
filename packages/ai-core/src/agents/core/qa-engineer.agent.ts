import { ModelBackedAgent } from "../base/model-backed-agent.js";

export class QaEngineerAgent extends ModelBackedAgent {
  constructor() {
    super({
      id: "qa-engineer",
      role: "QA engineer",
      instructionPath: "packages/ai-core/src/agents/core/qa-engineer.spec.md",
      focus: ["behavior evals", "seeded regressions", "runtime gates", "grounding checks", "release validation"]
    });
  }
}
