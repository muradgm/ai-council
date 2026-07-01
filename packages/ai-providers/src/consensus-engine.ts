import type { ProviderResponse } from "./provider-interface.js";
export class ConsensusEngine { synthesize(responses: ProviderResponse[]) { return [...responses].sort((a,b) => b.confidence - a.confidence)[0]; } }
