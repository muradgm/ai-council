export class ConfidenceEngine { shouldEscalate(confidence: number, threshold = 0.72) { return confidence < threshold; } }
