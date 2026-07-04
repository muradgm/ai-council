import type { ProviderHealthResponse, RuntimeActionResponse, RuntimeSnapshot } from "../types.js";
import { escapeHtml } from "../ui/escape.js";

type RuntimeWorkbenchProps = {
  lastRuntimeAction: RuntimeActionResponse | null;
  providerHealth: ProviderHealthResponse | null;
  runtime: RuntimeSnapshot | null;
  runtimeProject: string;
  runtimeTask: string;
};

export function renderRuntimeWorkspace(props: RuntimeWorkbenchProps) {
  return `
    <section class="surface runtime-surface">
      <div class="runtime-form">
        <label>
          <span>Project</span>
          <input id="runtimeProject" value="${escapeHtml(props.runtimeProject)}" />
        </label>
        <label>
          <span>Task</span>
          <textarea id="runtimeTask">${escapeHtml(props.runtimeTask)}</textarea>
        </label>
      </div>
      <div class="button-row">
        <button class="secondary-button" data-runtime-action="context">Generate context</button>
        <button class="primary-button" data-runtime-action="run">Run Council loop</button>
        <button class="secondary-button" data-runtime-action="eval">Score artifact</button>
        <button class="secondary-button" data-runtime-action="provider">Provider health</button>
      </div>
      <div class="runtime-output">${renderRuntime(props)}</div>
    </section>
  `;
}

export function renderRuntime(props: Pick<RuntimeWorkbenchProps, "lastRuntimeAction" | "providerHealth" | "runtime">) {
  const context = props.runtime?.latestContext;
  const evalReport = props.runtime?.latestEval;
  const artifactText = props.runtime?.artifactText || "";
  const checks = evalReport?.checks || [];
  return `
    <div class="runtime-grid">
      <div class="mini-panel">
        <h3>Latest context</h3>
        <p><strong>Project:</strong> ${escapeHtml(context?.project || "n/a")}</p>
        <p><strong>Workflow:</strong> ${escapeHtml(context?.recommendedWorkflow || "n/a")}</p>
        <p><strong>Engine:</strong> ${escapeHtml(context?.recommendedEngine || "n/a")}</p>
        <p><strong>Agents:</strong> ${escapeHtml((context?.recommendedAgents || []).join(", ") || "n/a")}</p>
      </div>
      <div class="mini-panel">
        <h3>Artifact quality</h3>
        <p><strong>Artifact:</strong> ${escapeHtml(props.runtime?.latestArtifact || "n/a")}</p>
        <p><strong>Score:</strong> ${escapeHtml(evalReport?.score ?? "n/a")} / threshold ${escapeHtml(evalReport?.threshold ?? "n/a")}</p>
        <div class="check-list">
          ${checks.slice(0, 8).map(check => `<div class="check-row ${check.passed ? "pass" : "fail"}"><span>${check.passed ? "PASS" : "FAIL"}</span>${escapeHtml(check.label)}</div>`).join("") || `<p class="muted">Run artifact scoring to populate checks.</p>`}
        </div>
      </div>
    </div>
    ${props.lastRuntimeAction ? `<pre class="console-output">${escapeHtml(props.lastRuntimeAction.command)}\n\n${escapeHtml(props.lastRuntimeAction.stdout || props.lastRuntimeAction.stderr || props.lastRuntimeAction.error || "")}</pre>` : ""}
    ${props.providerHealth ? `<pre class="console-output">${escapeHtml(props.providerHealth.command)}\n\n${escapeHtml(props.providerHealth.stdout || props.providerHealth.stderr || props.providerHealth.error || "")}</pre>` : ""}
    <details class="artifact-preview" ${artifactText ? "open" : ""}>
      <summary>Latest runtime artifact preview</summary>
      <pre>${escapeHtml(artifactText || "No runtime artifact has been generated yet.")}</pre>
    </details>
  `;
}
