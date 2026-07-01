import type { AIProvider } from "./provider-interface.js";
export class CostEngine { rankByCost(providers: AIProvider[]) { const order = { local: 0, freemium: 1, premium: 2 } as const; return [...providers].sort((a,b) => order[a.tier] - order[b.tier]); } }
