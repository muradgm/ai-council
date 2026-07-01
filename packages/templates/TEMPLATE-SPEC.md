# AI Council Template Specification

Every deliverable template must include:

1. `TEMPLATE.md` — human-readable template.
2. `template.json` — machine-readable manifest.
3. `checklist.md` — quality checklist.
4. `example.md` — example output.
5. `prompt.md` — invocation prompt for AI agents.

## Manifest shape

```json
{
  "name": "prd",
  "title": "PRD",
  "category": "product",
  "entrypoint": "TEMPLATE.md",
  "skills": [],
  "agents": [],
  "decisionEngines": [],
  "workflows": [],
  "keywords": [],
  "outputs": []
}
```

## Template writing rules

- Use explicit sections.
- Prefer checkboxes where completion matters.
- Use placeholders like `{{project}}`, `{{date}}`, and `{{owner}}`.
- Include assumptions and open questions.
- Include quality gates.
- Never present uncertain claims as facts.
- For trading and finance templates, include risk boundaries and no-guarantee language.
