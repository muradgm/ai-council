# AI Providers Package

This package defines how AI Council selects and uses model providers.

It is intentionally **policy-first**. Local providers are preferred for private work. Selected cloud adapters are env-backed, redacted, and blocked unless the request explicitly allows external routing.

## Provider tiers

- **Local**: Ollama, LM Studio, llama.cpp. Use for private repository context, secrets, local drafts, and low-risk coding help.
- **Freemium**: DeepSeek, Gemini Free, Grok, Mistral, OpenRouter. Use for medium-sized work where cost matters.
- **Premium**: OpenAI, Anthropic, Gemini Pro, Together. Use for high-risk architecture, complex reasoning, security, financial/trading analysis, and major refactors.

## Default rule

Use the cheapest provider that can safely complete the task, but escalate when privacy, risk, reasoning depth, or quality gates require it.

## Configured cloud adapters

These adapters can make real HTTP calls when their env var is set and the request is not `local-only`:

- OpenAI: `OPENAI_API_KEY`
- Gemini Free / Gemini Pro: `GEMINI_API_KEY`
- DeepSeek: `DEEPSEEK_API_KEY`
- Grok / xAI: `XAI_API_KEY`
- Mistral: `MISTRAL_API_KEY`

Use `pnpm providers:health` to check configuration. It reports only configured/missing status and never prints key values.

On Windows, save a rotated key to the user environment with:

```bash
pnpm providers:set-env GEMINI_API_KEY "<key>"
```

Restart the API/web dev servers after changing environment variables.
