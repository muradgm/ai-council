import type { CouncilDefinition } from "./council.types.js";
export const councils: CouncilDefinition[] = [
 { id: "coding-council", description: "Feature implementation, bug fixes, and code quality.", agents: ["software-architect","backend-engineer","frontend-engineer","qa-engineer","security-architect","final-synthesizer"] },
 { id: "architecture-council", description: "System design and major technical decisions.", agents: ["software-architect","database-architect","devops-engineer","security-architect","ai-engineer","final-synthesizer"] },
 { id: "security-council", description: "Threat modeling, appsec, privacy, and risky operations.", agents: ["security-architect","software-architect","backend-engineer","qa-engineer","final-synthesizer"] },
 { id: "product-council", description: "Product strategy, UX, user value, and prioritization.", agents: ["product-strategist","ux-strategist","software-architect","final-synthesizer"] }
];
export function getCouncil(id: string) { return councils.find(c => c.id === id); }
