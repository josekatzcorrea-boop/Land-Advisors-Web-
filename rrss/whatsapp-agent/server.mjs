#!/usr/bin/env node
/**
 * Webhook WhatsApp Cloud API — Land Advisors
 * GET  /webhook — verificación Meta
 * POST /webhook — mensajes entrantes
 * GET  /health  — ping
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isCampaignSource } from "./lib/activation.mjs";
import { config } from "./lib/config.mjs";
import { createSession, handleInbound } from "./lib/flow-engine.mjs";
import { loadAllSessions, loadSession } from "./lib/sessions-store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sessions = new Map();
const seenMessageIds = new Set();

for (const [waId, session] of Object.entries(loadAllSessions())) {
  sessions.set(waId, session);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

async function processWebhook(body) {
  console.log("[webhook] POST received, entries:", body.entry?.length ?? 0);
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const field = change.field || "";
      if (!value.messages?.length) {
        console.log("[webhook] event:", field || "unknown", "(no messages)");
      }
      for (const message of value.messages || []) {
        if (seenMessageIds.has(message.id)) {
          console.log("[webhook] duplicate skip:", message.id);
          continue;
        }
        seenMessageIds.add(message.id);
        if (message.type !== "text") {
          console.log("[webhook] skip type:", message.type, "from:", message.from);
          continue;
        }
        const waId = message.from;
        const text = message.text?.body || "";
        console.log("[webhook] inbound from", waId, ":", text.slice(0, 80));
        let session = sessions.get(waId);
        if (!session) {
          session = loadSession(waId) || createSession(waId);
          sessions.set(waId, session);
        }
        try {
          const referral = message.referral || null;
          if (session.step === "direct" && !isCampaignSource(text, referral)) {
            return;
          }
          await handleInbound(session, text, referral);
        } catch (err) {
          console.error("[wa-agent]", waId, err.message || err);
        }
      }
    }
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "land-advisors-whatsapp-agent" }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/coexistencia") {
    const htmlPath = path.join(__dirname, "coexistence-signup.html");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(htmlPath, "utf8"));
    return;
  }

  if (req.method === "GET" && url.pathname === "/webhook") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === config.verifyToken) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(challenge || "");
      console.log("[webhook] verified");
      return;
    }
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (req.method === "POST" && url.pathname === "/webhook") {
    try {
      const body = await readJson(req);
      res.writeHead(200);
      res.end("OK");
      processWebhook(body).catch((err) => console.error("[webhook] async error:", err));
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end("Error");
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(config.port, () => {
  console.log(`WhatsApp agent listening on :${config.port}`);
  console.log(`Webhook path: /webhook`);
  if (!config.waToken) console.warn("WARN: META_WA_ACCESS_TOKEN missing in .env");
});
