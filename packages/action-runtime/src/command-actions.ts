import type { ActionIntent } from "./action-intent.js";

export function runCommandAction(id: string, command: string, description = "Run command"): ActionIntent {
  return {
    id,
    kind: "run_command",
    command,
    description
  };
}

export function installPackageAction(id: string, command: string, description = "Install package"): ActionIntent {
  return {
    id,
    kind: "install_package",
    command,
    description
  };
}
