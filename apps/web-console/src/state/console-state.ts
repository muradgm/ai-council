import type { AskResponse, CollectionName } from "../types.js";

export type ChatAttachment = {
  name: string;
  type: string;
  size: number;
  text?: string;
};

export type LocalProject = {
  id: string;
  name: string;
  fileCount: number;
  files: ChatAttachment[];
  preview: string;
  importedAt: string;
};

export type ChatMessage = { role: "user" | "assistant"; text: string; meta?: AskResponse; attachments?: ChatAttachment[] };

export type NavItem = {
  label: string;
  icon: string;
  view: "chat" | "projects" | "data" | "catalog" | "runtime";
  collection?: CollectionName;
};
