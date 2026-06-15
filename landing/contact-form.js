/**
 * Formulario de contacto → envío automático a WhatsApp del consultor (CallMeBot).
 * Preferir webhookUrl (Google Apps Script) para evitar CORS.
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

  function callMeBotUrl(phone, apiKey, text) {
    const params = new URLSearchParams({
      source: "web",
      phone: phone,
      text: text,
      apikey: apiKey,
    });
    return "https://api.callmebot.com/whatsapp.php?" + params.toString();
  }

  function sendViaWebhook(webhookUrl, text) {
    return fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ text: text }),
    }).then(function (res) {
      return res.text().then(function (body) {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          throw new Error("invalid_response");
        }
        if (!data.ok) {
          throw new Error(data.error || "send_failed");
        }
        return { confirmed: true, result: data.result || "queued" };
      });
    });
  }

  function tryIframeGet(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.cssText = "position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none";
      let done = false;

      function finish(ok) {
        if (done) return;
        done = true;
        iframe.remove();
        if (ok) resolve();
        else reject(new Error("iframe_failed"));
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
        finish(false);
      }, timeoutMs || 5000);
    });
  }

  function tryNoCorsFetch(url) {
    return fetch(url, { method: "GET", mode: "no-cors" });
  }

  function tryImageBeacon(url) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () {
        resolve();
      };
      img.onerror = function () {
        reject(new Error("beacon_failed"));
      };
      img.src = url;
      window.setTimeout(function () {
        reject(new Error("beacon_timeout"));
      }, 5000);
    });
  }

  function sendClientFallbacks(text, phone, apiKey) {
    const url = callMeBotUrl(phone, apiKey, text);
    return tryIframeGet(url, 5000)
      .catch(function () {
        return tryNoCorsFetch(url);
      })
      .catch(function () {
        return tryImageBeacon(url);
      })
      .then(function () {
        return { confirmed: false };
      })
      .catch(function () {
        return { confirmed: false };
      });
  }

  function sendAutoWhatsApp(text) {
    const cfg = config();
    const webhookUrl = (cfg.webhookUrl || "").trim();
    const apiKey = (cfg.apiKey || "").trim();
    const phone = normalizePhone(cfg.phone);

    if (!cfg.enabled) {
      return Promise.reject(new Error("not_configured"));
    }
    if (webhookUrl) {
      return sendViaWebhook(webhookUrl, text);
    }
    if (apiKey) {
      return sendClientFallbacks(text, phone, apiKey);
    }
    return Promise.reject(new Error("not_configured"));
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
      const webhookUrl = (cfg.webhookUrl || "").trim();
      const apiKey = (cfg.apiKey || "").trim();
      const autoSend = cfg.enabled && (webhookUrl || apiKey);

      if (!autoSend) {
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
        .then(function (result) {
          if (result && result.confirmed) {
            setStatus(
              form,
              "¡Listo! Recibimos tu solicitud. Te contactaremos pronto por WhatsApp o correo.",
              "success"
            );
            form.reset();
            return;
          }
          setStatus(
            form,
            "Intentamos enviar tu solicitud, pero no pudimos confirmarlo desde el navegador. Te contactaremos pronto o escríbenos por el botón verde de WhatsApp.",
            "info"
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
