import type { CouncilRequest } from "../../../shared/src/index.js";
import { classifyCouncilRoute } from "./routing-classifier.js";

export class CouncilSelector {
  select(request: CouncilRequest) {
    return classifyCouncilRoute(request).councilId;
  }
}
