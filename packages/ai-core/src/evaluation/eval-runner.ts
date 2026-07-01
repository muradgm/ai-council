export interface EvalResult { name: string; passed: boolean; score: number; notes: string[]; }
export class EvalRunner { async runSmokeEval(): Promise<EvalResult> { return { name: "smoke-eval", passed: true, score: 1, notes: ["Evaluation framework scaffold is callable."] }; } }
