import type { CouncilRequest } from "../../shared/src/index.js";
export class PrivacyEngine {
  resolvePrivacy(request: CouncilRequest) { return request.privacyLevel ?? "local-only"; }
  sanitize(input: string) { return input.replace(/OPENAI_API_KEY=\S+/g, "OPENAI_API_KEY=[REDACTED]").replace(/ANTHROPIC_API_KEY=\S+/g, "ANTHROPIC_API_KEY=[REDACTED]").replace(/password\s*=\s*\S+/gi, "password=[REDACTED]"); }
}
