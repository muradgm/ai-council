import type { ProviderRequest, ProviderResponse } from "../provider-interface.js";

type OpenAICompatibleOptions = {
  provider: string;
  envKey: string;
  modelEnvKey: string;
  defaultModel: string;
  endpointEnvKey: string;
  defaultEndpoint: string;
  confidence: number;
  costEstimateUsd: number;
};

type GeminiOptions = {
  provider: string;
  envKey: string;
  modelEnvKey: string;
  defaultModel: string;
  endpointEnvKey: string;
  defaultEndpoint: string;
  confidence: number;
  costEstimateUsd: number;
};

function unavailable(provider: string, model: string, text: string, warnings: string[] = []): ProviderResponse {
  return {
    provider,
    model,
    confidence: 0,
    costEstimateUsd: 0,
    text,
    warnings
  };
}

export function redactSecrets(input: string): string {
  return input
    .replace(/\b[A-Z][A-Z0-9_]*(?:API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*[^\s]+/g, match => {
      const [name] = match.split("=");
      return `${name}=[REDACTED]`;
    })
    .replace(/\b(?:sk|xai)-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_API_KEY]")
    .replace(/\b[A-Za-z0-9._-]{32,}\b/g, token => {
      const hasLetter = /[A-Za-z]/.test(token);
      const hasDigit = /\d/.test(token);
      const looksLikePath = token.includes("/") || token.includes("\\");
      return hasLetter && hasDigit && !looksLikePath ? "[REDACTED_TOKEN]" : token;
    });
}

function externalCallBlocked(request: ProviderRequest, provider: string, model: string): ProviderResponse | null {
  if (request.privacyLevel === "local-only") {
    return unavailable(
      provider,
      model,
      "External provider call blocked because privacyLevel is local-only.",
      ["Set privacyLevel to sanitized-external or external-allowed only after approval."]
    );
  }
  if (!request.allowNetwork) {
    return unavailable(
      provider,
      model,
      "External provider call blocked because allowNetwork was not enabled.",
      ["Cloud provider use must be an explicit runtime decision."]
    );
  }
  return null;
}

function configuredKey(envKey: string) {
  return process.env[envKey]?.trim();
}

async function readError(response: Response) {
  const text = await response.text().catch(() => "");
  return redactSecrets(text).slice(0, 600);
}

export async function callOpenAICompatible(request: ProviderRequest, options: OpenAICompatibleOptions): Promise<ProviderResponse> {
  const model = process.env[options.modelEnvKey] || options.defaultModel;
  const blocked = externalCallBlocked(request, options.provider, model);
  if (blocked) return blocked;

  const apiKey = configuredKey(options.envKey);
  if (!apiKey) {
    return unavailable(options.provider, model, `${options.provider} is not configured. Missing ${options.envKey}.`);
  }

  const endpoint = process.env[options.endpointEnvKey] || options.defaultEndpoint;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: redactSecrets(request.prompt) }],
        stream: false
      }),
      signal: AbortSignal.timeout(60_000)
    });

    if (!response.ok) {
      return unavailable(options.provider, model, `${options.provider} returned ${response.status}: ${await readError(response)}`);
    }

    const data = await response.json() as any;
    const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
    if (!text) return unavailable(options.provider, model, `${options.provider} returned no text content.`);

    return {
      provider: options.provider,
      model: data?.model || model,
      confidence: options.confidence,
      costEstimateUsd: options.costEstimateUsd,
      text: String(text),
      warnings: request.privacyLevel === "sanitized-external" ? ["Prompt was redacted before external provider call."] : []
    };
  } catch (error) {
    return unavailable(options.provider, model, `${options.provider} call failed: ${redactSecrets(String(error))}`);
  }
}

export async function callGeminiGenerateContent(request: ProviderRequest, options: GeminiOptions): Promise<ProviderResponse> {
  const model = process.env[options.modelEnvKey] || options.defaultModel;
  const blocked = externalCallBlocked(request, options.provider, model);
  if (blocked) return blocked;

  const apiKey = configuredKey(options.envKey);
  if (!apiKey) {
    return unavailable(options.provider, model, `${options.provider} is not configured. Missing ${options.envKey}.`);
  }

  const baseEndpoint = (process.env[options.endpointEnvKey] || options.defaultEndpoint).replace(/\/$/, "");
  const endpoint = `${baseEndpoint}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: redactSecrets(request.prompt) }] }]
      }),
      signal: AbortSignal.timeout(60_000)
    });

    if (!response.ok) {
      return unavailable(options.provider, model, `${options.provider} returned ${response.status}: ${await readError(response)}`);
    }

    const data = await response.json() as any;
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((part: any) => part?.text || "")
      .filter(Boolean)
      .join("\n");
    if (!text) return unavailable(options.provider, model, `${options.provider} returned no text content.`);

    return {
      provider: options.provider,
      model,
      confidence: options.confidence,
      costEstimateUsd: options.costEstimateUsd,
      text,
      warnings: request.privacyLevel === "sanitized-external" ? ["Prompt was redacted before external provider call."] : []
    };
  } catch (error) {
    return unavailable(options.provider, model, `${options.provider} call failed: ${redactSecrets(String(error))}`);
  }
}
