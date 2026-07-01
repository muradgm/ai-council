import type { AIProvider } from "../../provider-interface.js";

type OllamaGenerateResponse = {
  response?: string;
  model?: string;
  done?: boolean;
};

function ollamaBaseUrl() {
  return (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
}

function ollamaModel() {
  return process.env.OLLAMA_MODEL || "llama3.1";
}

function fallbackText(prompt: string) {
  const text = prompt.toLowerCase();
  const asksAboutStart = /start|install|run|launch|serve/.test(text);
  if (asksAboutStart) {
    return [
      "Ollama is not reachable right now, but you can start it locally with these steps:",
      "1. Install Ollama from https://ollama.com/download",
      "2. Start the service with `ollama serve`",
      "3. In another terminal, verify it with `curl http://127.0.0.1:11434/api/tags`",
      "4. Pull a model such as `ollama pull llama3.1`"
    ].join("\n");
  }

  return "Ollama is not available. Start Ollama locally to enable model-backed runtime execution.";
}

export const ollamaProvider: AIProvider = {
  id: "ollama", tier: "local", displayName: "Ollama Local", supports: ["general", "coding", "planning"],
  async call(request) {
    const model = ollamaModel();
    const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 20_000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${ollamaBaseUrl()}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: request.prompt,
          stream: false
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        return {
          provider: "ollama",
          model,
          confidence: 0,
          costEstimateUsd: 0,
          text: "Ollama is reachable but returned an error. No model output was used.",
          warnings: [`Ollama HTTP ${response.status}: ${response.statusText}`]
        };
      }

      const data = await response.json() as OllamaGenerateResponse;
      return {
        provider: "ollama",
        model: data.model || model,
        confidence: data.response ? 0.74 : 0.2,
        costEstimateUsd: 0,
        text: data.response || "Ollama returned no response text.",
        warnings: data.done === false ? ["Ollama response did not report completion."] : []
      };
    } catch (error) {
      return {
        provider: "ollama",
        model,
        confidence: 0,
        costEstimateUsd: 0,
        text: fallbackText(request.prompt),
        warnings: [error instanceof Error ? error.message : String(error)]
      };
    } finally {
      clearTimeout(timeout);
    }
  }
};
