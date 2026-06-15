/**
 * Formulario de contacto → envío automático a WhatsApp del consultor (CallMeBot).
 * Si no está configurado, abre wa.me con el mensaje prellenado (el visitante debe enviar).
 */
(function () {
  const DEFAULT_PHONE = "+56974533265";

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

  function config() {
    return window.LA_WHATSAPP || {};
  }

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
    const widget =
      window.LAChatWidget &&
      window.LAChatWidget.CONFIG &&
      window.LAChatWidget.CONFIG.whatsapp &&
      window.LAChatWidget.CONFIG.whatsapp.href;
    const base = widget || "https://wa.me/56974533265";
    const sep = base.includes("?") ? "&" : "?";
    return base + sep + "text=" + encodeURIComponent(text);
  }

  function setStatus(form, message, type) {
    let el = form.querySelector(".form-status");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-status";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      form.appendChild(el);
    }
    el.textContent = message;
    el.hidden = !message;
    el.dataset.type = type || "";
  }

  function setSubmitting(form, submitting) {
    const btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    if (submitting) {
      if (!btn.dataset.label) btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Enviando…";
    } else {
      btn.disabled = false;
      if (btn.dataset.label) btn.textContent = btn.dataset.label;
    }
  }

  function normalizePhone(phone) {
    return String(phone || DEFAULT_PHONE).replace(/\s+/g, "").replace(/^\+/, "");
  }

  function sendAutoWhatsApp(text) {
    const cfg = config();
    const phone = normalizePhone(cfg.phone);
    const apiKey = (cfg.apiKey || "").trim();
    if (!cfg.enabled || !apiKey) {
      return Promise.reject(new Error("not_configured"));
    }

    const params = new URLSearchParams({
      source: "web",
      phone: phone,
      text: text,
      apikey: apiKey,
    });
    const url = "https://api.callmebot.com/whatsapp.php?" + params.toString();

    // CallMeBot no expone CORS al navegador; iframe evita el bloqueo.
    return new Promise(function (resolve, reject) {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.cssText = "position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none";
      let done = false;

      function finish(ok) {
        if (done) return;
        done = true;
        iframe.remove();
        if (ok) resolve("queued");
        else reject(new Error("send_failed"));
      }

      iframe.onload = function () {
        finish(true);
      };
      iframe.onerror = function () {
        finish(false);
      };

      document.body.appendChild(iframe);
      iframe.src = url;
      window.setTimeout(function () {
        finish(true);
      }, 3500);
    });
  }

  document.querySelectorAll(".contact-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get("website")) return;

      const intent = data.get("intent") || "";
      const message = buildMessage(data);

      if (typeof window.LA_track === "function") {
        window.LA_track("form_submit", { form_intent: intent, page_path: location.pathname });
      }

      const cfg = config();
      if (!cfg.enabled || !(cfg.apiKey || "").trim()) {
        window.open(whatsAppUrl(message), "_blank", "noopener,noreferrer");
        setStatus(
          form,
          "Se abrió WhatsApp con tu mensaje. Confírmalo con Enviar para que llegue a Land Advisors.",
          "info"
        );
        return;
      }

      setSubmitting(form, true);
      setStatus(form, "", "");

      sendAutoWhatsApp(message)
        .then(function () {
          setStatus(
            form,
            "¡Listo! Recibimos tu solicitud. Te contactaremos pronto por WhatsApp o correo.",
            "success"
          );
          form.reset();
        })
        .catch(function () {
          setStatus(
            form,
            "Hubo un problema al enviar. Intenta de nuevo o escríbenos por el botón verde de WhatsApp.",
            "error"
          );
        })
        .finally(function () {
          setSubmitting(form, false);
        });
    });
  });
})();
