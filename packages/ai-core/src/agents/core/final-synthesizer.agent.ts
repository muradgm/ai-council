import { ModelBackedAgent } from "../base/model-backed-agent.js";

export class FinalSynthesizerAgent extends ModelBackedAgent {
  constructor() {
    super({
      id: "final-synthesizer",
      role: "final synthesizer",
      instructionPath: "packages/ai-core/src/agents/core/final-synthesizer.spec.md",
      focus: ["agent consensus", "agent disagreement", "evidence strength", "decision quality", "next action selection"]
    });
  }
}
