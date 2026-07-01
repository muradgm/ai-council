export type ToolPermission = "disabled" | "read-only" | "read-write" | "approval-required";
export interface ToolDefinition { id: string; description: string; permission: ToolPermission; }
export class ToolRegistry { private tools = new Map<string, ToolDefinition>(); register(tool: ToolDefinition) { this.tools.set(tool.id, tool); } get(id: string) { return this.tools.get(id); } list() { return [...this.tools.values()]; } }
