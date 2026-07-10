import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appendActionLedger, createActionPlan, executeActionPlan } from "../packages/action-runtime/src/index.js";
import { classifyCouncilRoute, Orchestrator } from "../packages/ai-core/src/index.js";

type ProofResult = {
  ok: boolean;
  prompt: string;
  route: ReturnType<typeof classifyCouncilRoute>;
  contextFiles: string[];
  response: {
    selectedCouncil: string;
    selectedProvider: string;
    agentsUsed: string[];
    eventTypes: string[];
  };
  actionReport: {
    dryRun: boolean;
    total: number;
    allowed: number;
    approvalRequired: number;
    blocked: number;
    executed: number;
  };
  ledger?: {
    path: string;
    entries: number;
  };
};

const root = process.cwd();
const prompt = "@stl review the governance package for security gaps.";

const contextProfiles: Record<string, string[]> = {
  "governance-files": [
    "packages/action-runtime/src/governance-decision.ts",
    "packages/action-runtime/src/action-executor.ts",
    "packages/action-runtime/src/action-intent.ts",
    "packages/governance/policies/approval-gates.md"
  ],
  "provider-routing": [
    "packages/ai-providers/src/model-router.ts",
    "packages/ai-providers/policies/model-routing-policy.md"
  ],
  "tool-contracts": [
    "packages/tool-contracts/boundaries/approval-matrix.md"
  ],
  "env-handling": [
    "infra/secrets/README.md",
    "scripts/secrets-scan.mjs"
  ]
};

function existingContextFiles(requiredContext: string[]) {
  return requiredContext
    .flatMap(item => contextProfiles[item] || [])
    .filter(rel => fs.existsSync(path.join(root, rel)));
}

function proofSummary(result: ProofResult) {
  return [
    "# AI Council E2E Proof",
    "",
    `Prompt: ${result.prompt}`,
    "",
    "## Route",
    "",
    `- Task type: ${result.route.taskType}`,
    `- Council: ${result.route.councilId}`,
    `- Lead agent: ${result.route.leadAgent}`,
    `- Support agents: ${result.route.supportAgents.join(", ") || "none"}`,
    `- Confidence: ${result.route.confidence}`,
    `- Reason: ${result.route.reason}`,
    "",
    "## Context",
    "",
    ...result.contextFiles.map(file => `- ${file}`),
    "",
    "## Response",
    "",
    `- Council: ${result.response.selectedCouncil}`,
    `- Provider: ${result.response.selectedProvider}`,
    `- Agents used: ${result.response.agentsUsed.join(", ")}`,
    `- Events: ${result.response.eventTypes.join(", ")}`,
    "",
    "## Governance Dry Run",
    "",
    `- Dry run: ${result.actionReport.dryRun}`,
    `- Total actions: ${result.actionReport.total}`,
    `- Allowed/logged: ${result.actionReport.allowed}`,
    `- Approval required: ${result.actionReport.approvalRequired}`,
    `- Blocked: ${result.actionReport.blocked}`,
    `- Executed: ${result.actionReport.executed}`,
    result.ledger ? `- Ledger: ${result.ledger.entries} entries appended to ${result.ledger.path}` : "- Ledger: skipped for test mode",
    ""
  ].join("\n");
}

export async function runE2eProof(writeReport = true): Promise<ProofResult> {
  const route = classifyCouncilRoute({
    input: prompt,
    projectId: "ai-council",
    privacyLevel: "local-only",
    riskLevel: "medium"
  });

  assert.equal(route.mention.requestedLeadAgent, "software-architect");
  assert.equal(route.taskType, "security_review");
  assert.equal(route.councilId, "security-council");
  assert.equal(route.leadAgent, "software-architect");
  assert.ok(route.supportAgents.includes("security-architect"));

  const contextFiles = existingContextFiles(route.requiredContext);
  assert.ok(contextFiles.some(file => file.includes("packages/action-runtime/src/governance-decision.ts")));
  assert.ok(contextFiles.some(file => file.includes("packages/governance/")));

  const context = contextFiles
    .slice(0, 5)
    .map(file => `Source: ${file}\n${fs.readFileSync(path.join(root, file), "utf8").slice(0, 1200)}`)
    .join("\n\n---\n\n");

  const orchestrator = new Orchestrator();
  const response = await orchestrator.run({
    input: `${prompt}\n\nRelevant context:\n${context}`,
    projectId: "ai-council",
    privacyLevel: "local-only",
    riskLevel: "medium"
  });

  assert.equal(response.selectedCouncil, "security-council");
  assert.equal(response.agentsUsed[0], "software-architect");
  assert.ok(response.agentsUsed.includes("security-architect"));
  assert.ok(response.events?.some(event => event.type === "context_read"));
  assert.ok(response.events?.some(event => event.type === "agent_started"));
  assert.ok(response.events?.some(event => event.type === "final_answer_streamed"));
  assert.ok(response.answer.includes("Findings:"));
  assert.ok(response.answer.includes("Risks:"));
  assert.ok(response.answer.includes("Next move:"));
  assert.ok(response.answer.includes("Evidence:"));

  const actionPlan = createActionPlan("ai-council", "update source runtime and create governed security review report", true);
  const actionReport = executeActionPlan(actionPlan, { writeReport: false });

  assert.equal(actionReport.dryRun, true);
  assert.equal(actionReport.summary.executed, 0);
  assert.ok(actionReport.summary.approvalRequired > 0);
  assert.ok(actionReport.summary.allowed > 0);

  const ledger = writeReport ? appendActionLedger(actionReport) : undefined;

  const result: ProofResult = {
    ok: true,
    prompt,
    route,
    contextFiles,
    response: {
      selectedCouncil: response.selectedCouncil,
      selectedProvider: response.selectedProvider,
      agentsUsed: response.agentsUsed,
      eventTypes: response.events?.map(event => event.type) || []
    },
    actionReport: {
      dryRun: actionReport.dryRun,
      total: actionReport.summary.total,
      allowed: actionReport.summary.allowed,
      approvalRequired: actionReport.summary.approvalRequired,
      blocked: actionReport.summary.blocked,
      executed: actionReport.summary.executed
    },
    ledger: ledger ? { path: ledger.path, entries: ledger.entries.length } : undefined
  };

  if (writeReport) {
    const reportDir = path.join(root, "storage/runtime/proofs");
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, "latest-e2e-proof.md"), proofSummary(result));
  }

  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runE2eProof();
  console.log(JSON.stringify(result, null, 2));
}
