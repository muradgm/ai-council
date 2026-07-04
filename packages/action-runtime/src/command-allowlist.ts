export const allowedValidationCommands = [
  "pnpm test",
  "pnpm build",
  "pnpm lint",
  "pnpm validate:knowledge",
  "pnpm final:validate",
  "pnpm gates:run"
];

export function isAllowedValidationCommand(command = "") {
  return allowedValidationCommands.includes(command.trim());
}
