# Project Detection Policy

Detect the active project using this order:

1. Explicit project name in the user request.
2. Current working directory if inside `projects/<name>`.
3. Existing project context file in `storage/memory/projects/<name>`.
4. Keyword match against project descriptions.
5. Ask the user only if the action would change files and the project remains ambiguous.
