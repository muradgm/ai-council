import type { Agent } from "./agent-contract.js";
import { SoftwareArchitectAgent } from "../core/software-architect.agent.js";
import { BackendEngineerAgent } from "../core/backend-engineer.agent.js";
import { FrontendEngineerAgent } from "../core/frontend-engineer.agent.js";
import { DatabaseArchitectAgent } from "../core/database-architect.agent.js";
import { AiEngineerAgent } from "../core/ai-engineer.agent.js";
import { SecurityArchitectAgent } from "../core/security-architect.agent.js";
import { QaEngineerAgent } from "../core/qa-engineer.agent.js";
import { DevopsEngineerAgent } from "../core/devops-engineer.agent.js";
import { ProductStrategistAgent } from "../core/product-strategist.agent.js";
import { UxStrategistAgent } from "../core/ux-strategist.agent.js";
import { RefactorSpecialistAgent } from "../core/refactor-specialist.agent.js";
import { FinalSynthesizerAgent } from "../core/final-synthesizer.agent.js";
export class AgentRegistry {
  private agents = new Map<string, Agent>();
  constructor() { [new SoftwareArchitectAgent(),new BackendEngineerAgent(),new FrontendEngineerAgent(),new DatabaseArchitectAgent(),new AiEngineerAgent(),new SecurityArchitectAgent(),new QaEngineerAgent(),new DevopsEngineerAgent(),new ProductStrategistAgent(),new UxStrategistAgent(),new RefactorSpecialistAgent(),new FinalSynthesizerAgent()].forEach(a => this.register(a)); }
  register(agent: Agent) { this.agents.set(agent.id, agent); }
  get(id: string) { return this.agents.get(id); }
  select(ids: string[]) { return ids.map(id => this.get(id)).filter(Boolean) as Agent[]; }
  list() { return [...this.agents.values()]; }
}
