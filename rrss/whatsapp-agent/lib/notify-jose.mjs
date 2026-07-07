import { config, flow } from "./config.mjs";

export async function notifyJose(session, tag) {
  if (!config.notifyWebhook) return;
  const d = session.data || {};
  const text = [
    "🔔 Lead campaña búsqueda 30%",
    tag ? `Etiqueta: ${tag}` : "",
    `WA: ${session.waId}`,
    d.objective ? `Objetivo: ${d.objective}` : "",
    d.budgetUf ? `Presupuesto: ${d.budgetUf}` : "",
    d.zoneInterest ? `Zona: ${d.zoneInterest}` : "",
    d.timeline ? `Plazo: ${d.timeline}` : "",
    d.buyerLocation ? `Ubicación: ${d.buyerLocation}` : "",
    d.source ? `Origen: ${d.source}` : "",
    `→ Agendar: ${flow.calendarUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const url = `${config.notifyWebhook}?text=${encodeURIComponent(text)}`;
  await fetch(url).catch(() => {});
}
