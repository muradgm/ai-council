import type { CouncilRequest } from "../../../shared/src/index.js";
export class PolicyEngine { validate(request: CouncilRequest) { const warnings: string[] = []; if (request.input.includes(".env")) warnings.push("Potential secret-bearing file referenced. Sanitize before external provider routing."); return { allowed: true, warnings }; } }
