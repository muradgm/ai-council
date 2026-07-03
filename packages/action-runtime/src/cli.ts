import { approvalFor, createActionPlan, executeActionPlan } from "./index.js";

const [projectArg = "ai-council", ...rest] = process.argv.slice(2);
const dryRun = rest.includes("--dry-run") || !rest.includes("--execute");
const approvals = rest
  .map((arg, index) => arg === "--approve" ? rest[index + 1] : undefined)
  .filter((arg): arg is string => Boolean(arg))
  .map(actionId => approvalFor(actionId, "cli", "manual"));
const request = rest.filter((arg, index) => {
  if (arg === "--dry-run" || arg === "--execute" || arg === "--approve") return false;
  if (rest[index - 1] === "--approve") return false;
  return true;
}).join(" ") || "No action request provided";

const plan = createActionPlan(projectArg, request, dryRun);
const report = executeActionPlan(plan, { approvals });

console.log(JSON.stringify(report, null, 2));

if (!dryRun && approvals.length === 0) {
  console.error("Non-dry-run execution requires at least one --approve <action-id> flag.");
  process.exitCode = 2;
}
