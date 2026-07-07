import fs from "fs";
import path from "path";
import { ROOT } from "./config.mjs";

const FILE = path.join(ROOT, "sessions.json");

function readAll() {
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

export function loadSession(waId) {
  const all = readAll();
  return all[waId] || null;
}

export function saveSession(session) {
  const all = readAll();
  all[session.waId] = {
    waId: session.waId,
    step: session.step,
    data: session.data,
    agentActive: session.agentActive,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
}

export function loadAllSessions() {
  return readAll();
}
