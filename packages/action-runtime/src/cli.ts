import { createActionPlan, executeActionPlan } from "./index.js";

const [projectArg = "ai-council", ...rest] = process.argv.slice(2);
const dryRun = rest.includes("--dry-run") || !rest.includes("--execute");
const request = rest.filter(arg => arg !== "--dry-run" && arg !== "--execute").join(" ") || "No action request provided";

const plan = createActionPlan(projectArg, request, dryRun);
const report = executeActionPlan(plan);

console.log(JSON.stringify(report, null, 2));

if (!dryRun) {
  console.error("Non-dry-run execution is not enabled yet. Approve and implement concrete executors in a later slice.");
  process.exitCode = 2;
}
