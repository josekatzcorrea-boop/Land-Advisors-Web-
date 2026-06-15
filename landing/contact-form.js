/**
 * Formulario de contacto → WhatsApp con datos del visitante.
 */
(function () {
  const WHATSAPP_NUMBER = "56974533265";

  const INTENT_LABELS = {
    diagnostico: "Diagnóstico estratégico (1 UF)",
    busqueda: "Búsqueda personalizada (5 UF)",
    estudio: "Estudio de potencial inmobiliario",
    estructuracion: "Estructuración de proyecto",
    otro: "Otro / aún no sé",
  };

  const PERFIL_LABELS = {
    patrimonial: "Inversionista patrimonial",
    familia: "Familia — calidad de vida",
    desarrollador: "Inversionista desarrollador",
    empresario: "Empresario local",
    otro: "Otro",
  };

  function label(map, value) {
    return (value && map[value]) || value || "—";
  }

  function buildMessage(data) {
    return [
      "*Nueva solicitud — Land Advisors*",
      "",
      "Nombre: " + (data.get("nombre") || "").trim(),
      "Correo: " + (data.get("email") || "").trim(),
      "Teléfono: " + (data.get("telefono") || "").trim(),
      "Servicio: " + label(INTENT_LABELS, data.get("intent")),
      "Perfil: " + label(PERFIL_LABELS, data.get("perfil")),
      "",
      "Objetivo:",
      (data.get("mensaje") || "").trim(),
    ].join("\n");
  }

  function whatsAppUrl(text) {
    const base =
      (window.LAChatWidget && window.LAChatWidget.CONFIG && window.LAChatWidget.CONFIG.whatsapp && window.LAChatWidget.CONFIG.whatsapp.href) ||
      "https://wa.me/" + WHATSAPP_NUMBER;
    const sep = base.includes("?") ? "&" : "?";
    return base + sep + "text=" + encodeURIComponent(text);
  }

  document.querySelectorAll(".contact-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get("website")) return;

      const intent = data.get("intent") || "";
      if (typeof window.LA_track === "function") {
        window.LA_track("form_submit", { form_intent: intent, page_path: location.pathname });
      }

      window.open(whatsAppUrl(buildMessage(data)), "_blank", "noopener,noreferrer");
    });
  });
})();
