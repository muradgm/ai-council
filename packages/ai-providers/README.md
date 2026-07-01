# AI Providers Package

This package defines how AI Council selects and uses model providers.

It is intentionally **policy-first**. Provider calls are placeholders until real adapters are wired with API clients. The routing, privacy, cost, and fallback rules are usable now by Codex or any coding agent reading the repo.

## Provider tiers

- **Local**: Ollama, LM Studio, llama.cpp. Use for private repository context, secrets, local drafts, and low-risk coding help.
- **Freemium**: DeepSeek, Gemini Free, Grok, Mistral, OpenRouter. Use for medium-sized work where cost matters.
- **Premium**: OpenAI, Anthropic, Gemini Pro, Together. Use for high-risk architecture, complex reasoning, security, financial/trading analysis, and major refactors.

## Default rule

Use the cheapest provider that can safely complete the task, but escalate when privacy, risk, reasoning depth, or quality gates require it.
