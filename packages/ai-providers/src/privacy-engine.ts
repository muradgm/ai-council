import type { CouncilRequest } from "../../shared/src/index.js";
import { redactSecrets } from "./providers/http-provider-utils.js";

export class PrivacyEngine {
  resolvePrivacy(request: CouncilRequest) { return request.privacyLevel ?? "local-only"; }
  sanitize(input: string) {
    return redactSecrets(input).replace(/password\s*=\s*\S+/gi, "password=[REDACTED]");
  }
}
