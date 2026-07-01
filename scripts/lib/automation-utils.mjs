import fs from 'node:fs';
import path from 'node:path';

export const root = process.cwd();
export const automationRoot = path.join(root, 'storage', 'automation');

export function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
export function slug(input) { return String(input || 'general').trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'general'; }
export function now() { return new Date().toISOString(); }
export function readJson(file, fallback) { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; } }
export function writeJson(file, data) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); }
export function appendJsonArray(file, item) { const arr = readJson(file, []); arr.push(item); writeJson(file, arr); return item; }
export function projectBacklogPath(project) { return path.join(automationRoot, 'backlog', `${project}.json`); }
export function loadBacklog(project) { return readJson(projectBacklogPath(project), { project, items: [] }); }
export function saveBacklog(project, data) { writeJson(projectBacklogPath(project), data); }
export function taskId(project, title) { return `${slug(project)}-${Date.now()}-${slug(title).slice(0,32)}`; }
export function riskFor(text) { const t = String(text || '').toLowerCase(); if (/deploy|production|delete|secret|credential|trade|order|money|payment|migration/.test(t)) return 'high'; if (/auth|security|database|provider|api|finance|trading|architecture/.test(t)) return 'medium'; return 'low'; }
export function priorityFor(text) { const t = String(text || '').toLowerCase(); if (/urgent|blocker|critical|mvp|release|bug/.test(t)) return 'high'; if (/nice|later|polish|minor/.test(t)) return 'low'; return 'medium'; }
export function approvalRequired(risk, text='') { return risk === 'high' || /deploy|delete|send|trade|payment|secret|production/.test(String(text).toLowerCase()); }
export function markdownFile(dir, filename, content) { ensureDir(dir); const file = path.join(dir, filename); fs.writeFileSync(file, content.trim() + '\n'); return file; }
