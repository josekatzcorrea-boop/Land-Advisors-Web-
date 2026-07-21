/**
 * Persistencia de leads de partners — desacoplado para integraciones futuras.
 * @param {Object} lead
 * @returns {Promise<Object>} registro guardado
 */
window.savePartnerLead = function savePartnerLead(lead) {
  const cfg = window.LA_PARTNER_LEADS || {};
  const storageKey = cfg.storageKey || "la_partner_leads";

  const record = {
    fecha: new Date().toISOString(),
    nombre: String(lead.nombre || "").trim(),
    email: String(lead.email || "").trim(),
    telefono: String(lead.telefono || "").trim(),
    ciudad: String(lead.ciudad || "").trim(),
    comentario: String(lead.comentario || "").trim(),
    partner: String(lead.partner || "").trim(),
    partnerId: String(lead.partnerId || "").trim(),
    source: "Land Advisors Website",
  };

  function persistLocal() {
    try {
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existing.push(record);
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch (err) {
      console.warn("[LA Partners] localStorage no disponible", err);
    }
  }

  function postWebhook(url, payload, asPlainText) {
    var headers = asPlainText
      ? { "Content-Type": "text/plain;charset=utf-8" }
      : { "Content-Type": "application/json;charset=utf-8" };
    return fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
      // keepalive: si el usuario navega al partner, el POST igual intenta completarse
      keepalive: true,
    }).then(function (res) {
      if (!res.ok) throw new Error("webhook_http_" + res.status);
      return res.text();
    });
  }

  function notifyWhatsApp() {
    const wa = window.LA_WHATSAPP || {};
    const webhookUrl = (wa.webhookUrl || "").trim();
    if (!cfg.notifyWhatsApp || !wa.enabled || !webhookUrl) {
      return Promise.resolve();
    }

    const text = [
      "*Lead partner — Land Advisors*",
      "",
      "Partner: " + record.partner,
      "Nombre: " + record.nombre,
      "Correo: " + record.email,
      "Teléfono: " + record.telefono,
      record.ciudad ? "Ciudad: " + record.ciudad : "",
      "",
      "Necesidad:",
      record.comentario,
      "",
      "Fuente: " + record.source,
      "Fecha: " + record.fecha,
    ]
      .filter(Boolean)
      .join("\n");

    return postWebhook(webhookUrl, { text: text }, true).catch(function () {
      /* no bloquear flujo si falla notificación */
    });
  }

  persistLocal();

  // No bloquear la UI: Apps Script + MailApp puede tardar varios segundos.
  // Disparamos webhooks en paralelo y resolvemos de inmediato para el usuario.
  const sheetsUrl = (cfg.webhookUrl || "").trim();
  if (sheetsUrl) {
    postWebhook(sheetsUrl, record, true).catch(function (err) {
      console.warn("[LA Partners] webhook Sheets", err);
    });
  }
  notifyWhatsApp();

  return Promise.resolve(record);
};
