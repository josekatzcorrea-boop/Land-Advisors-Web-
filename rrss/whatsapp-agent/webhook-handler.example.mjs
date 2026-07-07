/**
 * Esqueleto webhook WhatsApp Cloud API — Land Advisors
 *
 * Desplegar en Cloudflare Worker / Node con HTTPS público.
 * Variables de entorno:
 *   META_WA_TOKEN, META_WA_PHONE_ID, META_VERIFY_TOKEN, OPENAI_API_KEY
 *
 * Configurar en Meta: WhatsApp → Configuration → Webhook
 */

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const WA_TOKEN = process.env.META_WA_TOKEN;
const PHONE_ID = process.env.META_WA_PHONE_ID;

/** Estado en memoria — usar KV/Redis/Sheet en producción */
const sessions = new Map();

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/webhook") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response("Forbidden", { status: 403 });
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      const body = await request.json();
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const msg = change.value?.messages?.[0];
          if (!msg || msg.type !== "text") continue;
          const from = msg.from;
          const text = msg.text?.body?.trim() || "";
          const reply = await handleMessage(from, text);
          if (reply) await sendWhatsApp(from, reply);
        }
      }
      return new Response("OK", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleMessage(waId, text) {
  const session = sessions.get(waId) || { step: "welcome", data: {} };
  const lower = text.toLowerCase();

  if (["hablar con jose", "hablar con josé", "humano"].some((k) => lower.includes(k))) {
    sessions.set(waId, { step: "end", data: session.data });
    return "Te paso con el equipo de José Katz. En horario laboral respondemos pronto 🤝";
  }

  // Cargar messages.json y flow.json en build real
  const steps = ["welcome", "objective", "budget", "zone", "timeline", "location", "offer"];
  const prompts = {
    welcome: "¿Qué te gustaría hacer con el terreno? (vivienda, inversión, cabañas…)",
    objective: "¿En qué rango de presupuesto estás pensando para la compra del terreno?",
    budget: "¿Hay alguna zona del sur que te atraiga?",
    zone: "¿En qué plazo te gustaría avanzar?",
    timeline: "¿Desde dónde nos escribes?",
    location:
      "Gracias. La búsqueda personalizada está en 3,5 UF (promo hasta 30 sept) con diagnóstico incluido. Agenda reunión: https://calendar.app.google/NnBG8xc4b2HbByu67",
  };

  if (session.step === "welcome") {
    session.step = "objective";
    session.data.firstMessage = text;
    sessions.set(waId, session);
    return (
      "Hola, soy el asistente de Land Advisors 👋\n\n" +
      "Veo tu interés en la búsqueda personalizada (3,5 UF). " +
      prompts.welcome
    );
  }

  const idx = steps.indexOf(session.step);
  if (idx >= 0 && idx < steps.length - 1) {
    session.data[session.step] = text;
    session.step = steps[idx + 1];
    sessions.set(waId, session);
    return prompts[session.step] || prompts.location;
  }

  return "¿Quieres agendar reunión? https://calendar.app.google/NnBG8xc4b2HbByu67";
}

async function sendWhatsApp(to, body) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}
