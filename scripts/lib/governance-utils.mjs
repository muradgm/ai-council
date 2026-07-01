import fs from 'node:fs';
import path from 'node:path';

export const root = process.cwd();

export function ensureDir(rel) {
  const dir = path.join(root, rel);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function readJson(rel, fallback = null) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return fallback;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

export function writeJson(rel, value) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
  return file;
}

export function slug(input) {
  return String(input || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || 'item';
}

export function nowId(prefix = 'gov') {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').replace('Z', '')}`;
}

export function listJson(rel) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort().map(file => ({ file, data: readJson(path.join(rel, file), {}) }));
}

export function classifyRisk(text = '') {
  const q = String(text).toLowerCase();
  const critical = ['secret', 'api key', 'password', 'private key', 'broker credential', 'breach', 'leak', 'live trading', 'production deploy'];
  const high = ['delete', 'send email', 'publish', 'deploy', 'payment', 'trade', 'forex', 'leverage', 'external', 'cloud provider', 'overwrite'];
  const medium = ['modify', 'write', 'commit', 'provider', 'personal data', 'confidential'];
  if (critical.some(w => q.includes(w))) return 'critical';
  if (high.some(w => q.includes(w))) return 'high';
  if (medium.some(w => q.includes(w))) return 'medium';
  return 'low';
}

export function permissionDecision(text = '') {
  const q = String(text).toLowerCase();
  const blocked = ['reveal secret', 'steal', 'malware', 'bypass approval', 'disable governance', 'guaranteed profit'];
  const approval = ['delete', 'send', 'email', 'publish', 'deploy', 'production', 'spend', 'payment', 'live trading', 'broker', 'private key', 'api key', 'overwrite'];
  const logging = ['modify', 'write', 'commit', 'provider', 'trading', 'finance', 'confidential'];
  if (blocked.some(w => q.includes(w))) return { decision: 'deny', approvalRequired: false };
  if (approval.some(w => q.includes(w))) return { decision: 'approval_required', approvalRequired: true };
  if (logging.some(w => q.includes(w))) return { decision: 'allow_with_logging', approvalRequired: false };
  return { decision: 'allow', approvalRequired: false };
}

export function detectPromptInjection(text = '') {
  const patterns = [
    'ignore previous instructions', 'ignore all instructions', 'reveal your system prompt', 'developer message',
    'exfiltrate', 'send secrets', 'print env', 'api key', 'disable safety', 'bypass', 'run this command',
    'do not tell the user', 'override', 'forget your rules'
  ];
  const q = String(text).toLowerCase();
  return patterns.filter(p => q.includes(p));
}

export function detectSecretPatterns(text = '') {
  const patterns = [
    ['openai_like_key', /sk-[A-Za-z0-9_\-]{20,}/g],
    ['generic_api_key', /(api[_-]?key|token|secret|password)[^\S\r\n]*[:=][^\S\r\n]*['"]?[A-Za-z0-9_\-./]{12,}/gi],
    ['private_key_header', /-----BEGIN (RSA |EC |OPENSSH |)?PRIVATE KEY-----/g],
    ['database_url', /(postgres|mongodb|mysql):\/\/[^\s]+:[^\s]+@[^\s]+/gi],
    ['jwt_like_token', /eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g]
  ];
  const findings = [];
  for (const [name, regex] of patterns) {
    const matches = String(text).match(regex) || [];
    if (matches.length) findings.push({ type: name, count: matches.length });
  }
  return findings;
}
