#!/usr/bin/env node
/** Suscribe la app al WABA y muestra estado del webhook. */
import { config } from "../lib/config.mjs";

const version = config.graphVersion || "v25.0";
const waba = process.env.META_WA_BUSINESS_ACCOUNT_ID || "1519931339630253";
const base = `https://graph.facebook.com/${version}`;

async function api(path, opts = {}) {
  const res = await fetch(`${base}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${config.waToken}`,
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const phone = await api(`/${config.phoneNumberId}?fields=display_phone_number,verified_name`);
console.log("Número:", phone.data.display_phone_number || phone.data.id, phone.status === 200 ? "OK" : phone.data);

const subs = await api(`/${waba}/subscribed_apps`);
console.log("Apps suscritas al WABA:", JSON.stringify(subs.data, null, 2));

const hasApp = subs.data?.data?.some((a) => a.whatsapp_business_api_data);
if (!hasApp?.data?.length && subs.status === 200) {
  const sub = await api(`/${waba}/subscribed_apps`, { method: "POST" });
  console.log("Suscribir app:", sub.status, JSON.stringify(sub.data));
} else if (!subs.data?.data?.length) {
  const sub = await api(`/${waba}/subscribed_apps`, { method: "POST" });
  console.log("Suscribir app (retry):", sub.status, JSON.stringify(sub.data));
}

const subs2 = await api(`/${waba}/subscribed_apps`);
console.log("Después:", JSON.stringify(subs2.data, null, 2));

console.log("\nWebhook local esperado:");
console.log("  https://professor-drapery-uplifting.ngrok-free.dev/webhook");
console.log("  Token:", config.verifyToken);
console.log("\nSi Meta no envía POST, re-verifica URL en WhatsApp → Configuración → Webhook");
