import { config } from "./config.mjs";

export async function sendText(to, body) {
  if (!config.waToken || !config.phoneNumberId) {
    throw new Error("Falta META_WA_ACCESS_TOKEN o META_WA_PHONE_NUMBER_ID en .env");
  }
  const url = `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.waToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: body.slice(0, 4096) },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`WhatsApp API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}
