import type { ActionIntent } from "./action-intent.js";

export function createFileAction(id: string, target: string, description: string, contentPreview = ""): ActionIntent {
  return {
    id,
    kind: "create_file",
    target,
    description,
    contentPreview
  };
}

export function updateFileAction(id: string, target: string, description: string): ActionIntent {
  return {
    id,
    kind: "update_file",
    target,
    description
  };
}

export function createFolderAction(id: string, target: string, description: string): ActionIntent {
  return {
    id,
    kind: "create_folder",
    target,
    description
  };
}

export function deleteFileAction(id: string, target: string, description: string): ActionIntent {
  return {
    id,
    kind: "delete_file",
    target,
    description
  };
}
