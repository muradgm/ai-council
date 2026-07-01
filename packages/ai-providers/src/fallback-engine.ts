import type { AIProvider } from "./provider-interface.js";
export class FallbackEngine { nextProvider(providers: AIProvider[], failedProviderId: string) { return providers.find(p => p.id !== failedProviderId); } }
