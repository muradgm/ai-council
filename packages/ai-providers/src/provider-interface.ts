import type { PrivacyLevel } from "../../shared/src/index.js";

export type ProviderTier = "local" | "freemium" | "premium";
export type ProviderCapability = "general" | "coding" | "planning" | "research" | "analysis" | "vision" | "tool-use" | "long-context";

export interface ProviderRequest {
  prompt: string;
  privacyLevel: PrivacyLevel;
  riskLevel?: "low" | "medium" | "high" | "critical";
  taskType?: string;
  maxCostUsd?: number;
  allowNetwork?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ProviderResponse {
  text: string;
  provider: string;
  model: string;
  confidence: number;
  costEstimateUsd: number;
  warnings?: string[];
}

export interface AIProvider {
  id: string;
  tier: ProviderTier;
  displayName: string;
  supports: ProviderCapability[];
  call(request: ProviderRequest): Promise<ProviderResponse>;
}
