#!/usr/bin/env node
import { config } from "../lib/config.mjs";

const required = [
  ["META_WA_ACCESS_TOKEN", config.waToken],
  ["META_WA_PHONE_NUMBER_ID", config.phoneNumberId],
  ["META_WA_VERIFY_TOKEN", config.verifyToken],
];

let ok = true;
for (const [name, val] of required) {
  const status = val ? "OK" : "FALTA";
  console.log(`${status}  ${name}`);
  if (!val) ok = false;
}

console.log(config.notifyWebhook ? "OK  LA_NOTIFY_WEBHOOK_URL" : "—   LA_NOTIFY_WEBHOOK_URL (opcional)");

if (!ok) {
  console.log("\nCopia .env.example → .env y completa los valores.");
  process.exit(1);
}

const url = `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}`;
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${config.waToken}` },
});
const data = await res.json();
if (!res.ok) {
  console.error("Error API:", data);
  process.exit(1);
}
console.log("\nWhatsApp número conectado:", data.display_phone_number || data.id);
console.log("Listo para configurar webhook en Meta.");
