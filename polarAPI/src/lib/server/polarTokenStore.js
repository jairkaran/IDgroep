import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve('.polar_tokens.json');

function readAll() {
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeAll(obj) {
  fs.writeFileSync(FILE, JSON.stringify(obj, null, 2), 'utf-8');
}

export function getTokens() {
  const all = readAll();
  return all.tokens || null;
}

export function saveTokens(tokens) {
  const all = readAll();
  all.tokens = tokens;
  writeAll(all);
}

export function getUserId() {
  const all = readAll();
  return all.user_id || null;
}

export function saveUserId(userId) {
  const all = readAll();
  all.user_id = userId;
  writeAll(all);
}
