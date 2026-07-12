export type AgentMentionControlIntent = "help" | "list-agents";

export interface AgentMentionDefinition {
  token: string;
  agentId: string;
  label: string;
  aliases: string[];
  description: string;
}

export interface ParsedAgentMention {
  token: string;
  normalizedToken: string;
  agentId?: string;
  label?: string;
  aliasOf?: string;
  controlIntent?: AgentMentionControlIntent;
  known: boolean;
}

export interface AgentMentionParseResult {
  mentions: ParsedAgentMention[];
  requestedLeadAgent?: string;
  requestedLeadLabel?: string;
  controlIntent?: AgentMentionControlIntent;
  unknownTokens: string[];
}

export const AGENT_MENTION_DEFINITIONS: AgentMentionDefinition[] = [
  {
    token: "stl",
    agentId: "software-architect",
    label: "Senior Tech Lead",
    aliases: ["senior-tech-lead", "tech-lead", "lead", "architect", "arch"],
    description: "Lead technical judgement, architecture tradeoffs, repo reviews, and next-step decisions."
  },
  {
    token: "sec",
    agentId: "security-architect",
    label: "Security Architect",
    aliases: ["security", "security-architect", "appsec"],
    description: "Review privacy, provider/tool permissions, secrets, approval gates, and security risk."
  },
  {
    token: "qa",
    agentId: "qa-engineer",
    label: "QA Engineer",
    aliases: ["test", "testing", "qa-engineer", "reviewer"],
    description: "Check regression coverage, validation gates, acceptance risk, and release confidence."
  },
  {
    token: "ai",
    agentId: "ai-engineer",
    label: "AI Engineer",
    aliases: ["ai-engineer", "llm", "model", "models"],
    description: "Review agent behavior, model usage, prompts, provider routing, and AI evals."
  },
  {
    token: "ux",
    agentId: "ux-strategist",
    label: "UX Strategist",
    aliases: ["product-designer", "designer", "ux-strategist"],
    description: "Review flows, friction, clarity, information architecture, and user experience."
  },
  {
    token: "prod",
    agentId: "product-strategist",
    label: "Product Strategist",
    aliases: ["pm", "product", "product-manager", "product-strategist"],
    description: "Review product scope, wedge, prioritization, user value, and roadmap tradeoffs."
  },
  {
    token: "be",
    agentId: "backend-engineer",
    label: "Backend Engineer",
    aliases: ["backend", "api"],
    description: "Review APIs, services, data flow, and backend implementation details."
  },
  {
    token: "fe",
    agentId: "frontend-engineer",
    label: "Frontend Engineer",
    aliases: ["frontend", "ui"],
    description: "Review browser UI, client architecture, accessibility, state, and interaction behavior."
  },
  {
    token: "devops",
    agentId: "devops-engineer",
    label: "DevOps Engineer",
    aliases: ["ops", "infra"],
    description: "Review deployment, environment, containers, CI/CD, and observability."
  }
];

const CONTROL_TOKENS: Record<string, AgentMentionControlIntent> = {
  help: "help",
  agents: "list-agents"
};

function normalizeToken(token: string) {
  return token.replace(/^@/, "").trim().toLowerCase();
}

function mentionLookup() {
  const map = new Map<string, AgentMentionDefinition>();
  for (const definition of AGENT_MENTION_DEFINITIONS) {
    map.set(definition.token, definition);
    map.set(definition.agentId, definition);
    for (const alias of definition.aliases) map.set(alias, definition);
  }
  return map;
}

export function parseAgentMentions(input: string): AgentMentionParseResult {
  const lookup = mentionLookup();
  const matches = input.matchAll(/(^|[\s([{])@([a-zA-Z][a-zA-Z0-9_-]*)\b/g);
  const mentions: ParsedAgentMention[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const token = `@${match[2]}`;
    const normalizedToken = normalizeToken(token);
    const dedupeKey = normalizedToken;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const controlIntent = CONTROL_TOKENS[normalizedToken];
    if (controlIntent) {
      mentions.push({ token, normalizedToken, controlIntent, known: true });
      continue;
    }

    const definition = lookup.get(normalizedToken);
    if (!definition) {
      mentions.push({ token, normalizedToken, known: false });
      continue;
    }

    mentions.push({
      token,
      normalizedToken,
      agentId: definition.agentId,
      label: definition.label,
      aliasOf: definition.token,
      known: true
    });
  }

  const controlIntent = mentions.find(mention => mention.controlIntent)?.controlIntent;
  const leadMention = mentions.find(mention => mention.agentId);

  return {
    mentions,
    requestedLeadAgent: leadMention?.agentId,
    requestedLeadLabel: leadMention?.label,
    controlIntent,
    unknownTokens: mentions.filter(mention => !mention.known).map(mention => mention.token)
  };
}

export function agentMentionHelp() {
  return AGENT_MENTION_DEFINITIONS
    .map(definition => `@${definition.token} -> ${definition.label} (${definition.agentId}): ${definition.description}`)
    .join("\n");
}
