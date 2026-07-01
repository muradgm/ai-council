import fs from 'node:fs';
import path from 'node:path';

export const root = process.cwd();

export function toSlug(input) {
  return String(input || '')
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';
}

export function titleCase(input) {
  return String(input || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

export function readText(rel, fallback = '') {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return fallback;
  return fs.readFileSync(file, 'utf8');
}

export function writeText(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : content + '\n', 'utf8');
}

export function readJson(rel, fallback = null) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(rel, data) {
  writeText(rel, JSON.stringify(data, null, 2));
}

export function listDirs(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

export function dirsWithMarker(rel, marker) {
  return listDirs(rel).filter(name => fs.existsSync(path.join(root, rel, name, marker)));
}

export function loadManifestCollection({ rel, marker, manifest }) {
  return dirsWithMarker(rel, marker).map(name => {
    const manifestPath = path.join(root, rel, name, manifest);
    let data = { name };
    if (fs.existsSync(manifestPath)) {
      try { data = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
      catch { data = { name, invalidJson: true }; }
    }
    return { id: name, rel: `${rel}/${name}`, ...data };
  });
}

export function allCollections() {
  return {
    skills: loadManifestCollection({ rel: 'packages/skills', marker: 'SKILL.md', manifest: 'skill.json' }),
    agents: loadManifestCollection({ rel: 'packages/senior-agents', marker: 'AGENT.md', manifest: 'agent.json' }),
    engines: loadManifestCollection({ rel: 'packages/decision-engines', marker: 'ENGINE.md', manifest: 'engine.json' }),
    workflows: loadManifestCollection({ rel: 'packages/workflows', marker: 'WORKFLOW.md', manifest: 'workflow.json' }),
    templates: loadManifestCollection({ rel: 'packages/templates/deliverables', marker: 'TEMPLATE.md', manifest: 'template.json' }),
    evalSuites: loadManifestCollection({ rel: 'packages/evals/suites', marker: 'SUITE.md', manifest: 'suite.json' })
  };
}

export function scoreItem(item, request) {
  const hay = [
    item.id,
    item.name,
    item.title,
    item.category,
    item.summary,
    item.description,
    ...(Array.isArray(item.keywords) ? item.keywords : []),
    ...(Array.isArray(item.tags) ? item.tags : []),
    ...(Array.isArray(item.skills) ? item.skills : []),
    ...(Array.isArray(item.outputs) ? item.outputs : [])
  ].filter(Boolean).join(' ').toLowerCase();

  const words = String(request || '').toLowerCase().split(/[^a-z0-9+#.]+/).filter(w => w.length > 2);
  let score = 0;
  for (const word of words) {
    if (hay.includes(word)) score += 1;
    if (hay.includes(word.replace(/s$/, ''))) score += 0.25;
  }

  const phrase = String(request || '').toLowerCase();
  const domainBoosts = [
    ['trading forex risk market candle backtest journal', ['forex', 'trading', 'risk', 'quant', 'financial', 'portfolio', 'investment']],
    ['react frontend ui component dashboard page css tailwind', ['frontend', 'react', 'ui', 'design-system']],
    ['brand logo identity naming typography visual', ['brand', 'branding', 'logo', 'typography', 'identity']],
    ['architecture database backend api security auth', ['architecture', 'backend', 'database', 'security']],
    ['startup entrepreneur business validation pricing sales growth', ['startup', 'entrepreneur', 'business', 'growth', 'sales']],
    ['codex repo cli context memory workflow orchestrator', ['codex', 'orchestrator', 'workflow', 'memory', 'cli']]
  ];
  for (const [triggerWords, boosts] of domainBoosts) {
    if (triggerWords.split(' ').some(t => phrase.includes(t))) {
      if (boosts.some(b => hay.includes(b))) score += 3;
    }
  }

  const targetedBoosts = [
    { triggers: ['prd', 'requirements', 'acceptance', 'roadmap', 'mvp', 'feature'], targets: ['product', 'prd', 'requirements', 'feature-planning', 'product-strategy', 'feature-spec', 'roadmap', 'cpo'], amount: 6 },
    { triggers: ['codex', 'bootstrap', 'context pack', 'startup prompt', 'initialize'], targets: ['codex', 'router', 'documentation', 'prompt-engineering', 'project-manager', 'codex-session', 'codex-task-prompt', 'council-session-report'], amount: 7 },
    { triggers: ['route', 'routing', 'orchestrator', 'council'], targets: ['router', 'orchestrator', 'agent-design', 'core-reasoning', 'codex-session', 'council-session-report'], amount: 7 },
    { triggers: ['bug', 'production bug', 'investigate'], targets: ['bug-investigation', 'code-review', 'qa-engineer', 'testing', 'bug-investigation-report'], amount: 6 },
    { triggers: ['refactor', 'shared packages'], targets: ['refactor-system', 'architecture', 'software-architecture', 'technical-design-doc', 'principal-software-architect'], amount: 6 },
    { triggers: ['execute', 'build workflow', 'feature build'], targets: ['build-execution', 'project-manager', 'senior-fullstack-engineer', 'feature-spec', 'project-management'], amount: 6 },
    { triggers: ['release readiness', 'release'], targets: ['release-readiness', 'release-readiness-engine', 'release-readiness-report', 'qa-engineer', 'testing'], amount: 6 },
    { triggers: ['documentation production', 'documentation'], targets: ['documentation', 'documentation-engine', 'documentation-production', 'technical-writer', 'technical-design-doc'], amount: 6 },
    { triggers: ['golden examples', 'eval', 'evaluation', 'prompt'], targets: ['evals', 'llm-prompt-evaluation', 'prompt-evaluation', 'prompt-engineering', 'senior-ai-engineer', 'technical-writer', 'prompt-evaluation-report'], amount: 6 },
    { triggers: ['trading journal', 'trade journal', 'risk dashboard'], targets: ['trading-journal', 'trade-journal-entry', 'risk-management', 'trading-risk', 'product', 'feature-planning', 'prd'], amount: 6 },
    { triggers: ['memory', 'project context', 'context'], targets: ['memory', 'project-management', 'project-kickoff', 'project-brief', 'documentation', 'project-manager'], amount: 5 },
    { triggers: ['privacy', 'user memory', 'data retention'], targets: ['privacy', 'privacy-engine', 'legal', 'legal-risk-spotter', 'risk-review', 'security', 'risk-review-report'], amount: 7 },
    { triggers: ['threat model', 'security review'], targets: ['security', 'security-review', 'security-review-engine', 'cybersecurity-engineer', 'security-review-report'], amount: 7 },
    { triggers: ['risk dashboard', 'dashboard metrics', 'drawdown', 'metrics'], targets: ['risk-manager', 'product-manager', 'risk-management', 'trading-risk', 'feature-planning', 'feature-spec', 'product', 'trading-journal'], amount: 12 }
  ];
  for (const rule of targetedBoosts) {
    if (rule.triggers.some(t => phrase.includes(t))) {
      if (rule.targets.some(t => hay.includes(t))) score += rule.amount;
    }
  }

  const id = String(item.id || item.name || '').toLowerCase();
  if ((phrase.includes('risk dashboard') || phrase.includes('dashboard metrics')) && ['product-manager', 'feature-planning', 'feature-spec', 'prd'].includes(id)) score += 30;
  if (phrase.includes('prd') && ['product-manager', 'product-strategy-engine', 'feature-planning', 'prd'].includes(id)) score += 30;
  if (phrase.includes('context pack') && ['router', 'project-manager', 'codex-session', 'codex-task-prompt', 'documentation-engine'].includes(id)) score += 20;
  if (phrase.includes('refactor') && ['principal-software-architect', 'refactor-system', 'technical-design-doc', 'architecture-engine'].includes(id)) score += 20;
  return score;
}

export function routeRequest(request, limit = 5) {
  const collections = allCollections();
  const ranked = {};
  for (const [key, items] of Object.entries(collections)) {
    ranked[key] = items
      .map(item => ({ ...item, score: scoreItem(item, request) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, limit);
  }
  return ranked;
}

export function counts() {
  return {
    skills: dirsWithMarker('packages/skills', 'SKILL.md').length,
    agents: dirsWithMarker('packages/senior-agents', 'AGENT.md').length,
    engines: dirsWithMarker('packages/decision-engines', 'ENGINE.md').length,
    workflows: dirsWithMarker('packages/workflows', 'WORKFLOW.md').length,
    templates: dirsWithMarker('packages/templates/deliverables', 'TEMPLATE.md').length,
    evalSuites: dirsWithMarker('packages/evals/suites', 'SUITE.md').length,
    qualityGates: dirsWithMarker('packages/evals/quality-gates', 'GATE.md').length,
    observabilityRecords: listDirs('storage/observability').reduce((sum, dir) => {
      try { return sum + fs.readdirSync(path.join(root, 'storage/observability', dir)).filter(file => file.endsWith('.json')).length; } catch { return sum; }
    }, 0),
    projects: listDirs('projects').length
  };
}

export function projectCandidates(name) {
  const slug = toSlug(name);
  const normalized = String(name || '').toLowerCase();
  const projectDirs = listDirs('projects');
  const memoryDirs = listDirs('storage/memory/projects');
  const matches = [];
  for (const dir of projectDirs) {
    const n = dir.toLowerCase();
    if (n === slug || n.includes(slug) || slug.includes(n) || n.includes(normalized)) {
      matches.push({ type: 'project', name: dir, rel: `projects/${dir}` });
    }
  }
  for (const dir of memoryDirs) {
    const n = dir.toLowerCase();
    if (n === slug || n.includes(slug) || slug.includes(n) || n.includes(normalized)) {
      matches.push({ type: 'memory', name: dir, rel: `storage/memory/projects/${dir}` });
    }
  }
  return matches;
}

export function nowIso() {
  return new Date().toISOString();
}
