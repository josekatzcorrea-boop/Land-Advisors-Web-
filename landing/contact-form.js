/**
 * Formulario de contacto — captura lead + siguiente paso (calendario / WhatsApp).
 */
(function () {
  const DEFAULT_PHONE = "+56974533265";

  const INTENT_LABELS = {
    diagnostico: "Diagnóstico estratégico",
    busqueda: "Búsqueda personalizada",
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

  const TRACK_INTENT = {
    cta_diagnostico: "diagnostico",
    cta_contacto: "diagnostico",
    cta_busqueda: "busqueda",
    cta_estudio: "estudio",
    cta_estructuracion: "estructuracion",
  };

  const FORM_COPY = {
    diagnostico: {
      title: "Agenda tu diagnóstico estratégico",
      intro:
        "Cuéntanos tu situación. Al enviar, podrás elegir horario para la reunión (1 UF) o confirmar por WhatsApp con José.",
      submit: "Continuar — agendar diagnóstico",
      successTitle: "¡Listo! Ahora elige cómo reservar tu diagnóstico",
    },
    default: {
      title: "Agenda tu reunión estratégica",
      intro:
        "Cuéntanos tu situación. Al enviar, podrás elegir horario en el calendario o confirmar por WhatsApp con José.",
      submit: "Continuar — agendar reunión",
      successTitle: "¡Listo! Ahora elige cómo reservar tu reunión",
    },
  };

  function whatsappConfig() {
    return window.LA_WHATSAPP || {};
  }

  function calendarConfig() {
    return window.LA_CALENDAR || {};
  }

  function label(map, value) {
    return (value && map[value]) || value || "—";
  }

  function copyForIntent(intent) {
    return intent === "diagnostico" ? FORM_COPY.diagnostico : FORM_COPY.default;
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
    ].join("\n");
  }

  function buildVisitorWhatsApp(data) {
    const nombre = (data.get("nombre") || "").trim();
    const servicio = label(INTENT_LABELS, data.get("intent"));
    return [
      "Hola José, acabo de completar el formulario en landadvisors.cl.",
      "",
      "Soy " + (nombre || "—") + ". Me interesa: " + servicio + ".",
      "",
      "¿Podemos coordinar la reunión? Gracias.",
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

  function calendarUrl(intent) {
    const cfg = calendarConfig();
    const events = cfg["events"] || {};
    const specific = (events[intent] || "").trim();
    const fallback = (cfg.url || "").trim();
    const url = specific || fallback;
    if (!url) return "";
    return url;
  }

  function calendarEnabled(intent) {
    const cfg = calendarConfig();
    if (!cfg.enabled) return false;
    return Boolean(calendarUrl(intent));
  }

  function setStatus(form, message, type) {
    let el = form.querySelector(".form-status");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-status";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      const fields = form.querySelector(".contact-form-fields");
      if (fields) fields.appendChild(el);
      else form.appendChild(el);
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
    const cfg = whatsappConfig();
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

  function applyFormCopy(form, intent) {
    const copy = copyForIntent(intent);
    const titleEl = document.getElementById("contacto-form-title");
    const introEl = document.getElementById("contacto-form-intro");
    const submitBtn = form.querySelector('[type="submit"]');
    if (titleEl) titleEl.textContent = copy.title;
    if (introEl) introEl.textContent = copy.intro;
    if (submitBtn) {
      submitBtn.textContent = copy.submit;
      submitBtn.dataset.label = copy.submit;
    }
  }

  function setIntent(form, intent) {
    if (!intent || !INTENT_LABELS[intent]) return;
    const select = form.querySelector('[name="intent"]');
    if (select) select.value = intent;
    applyFormCopy(form, intent);
  }

  function readIntentFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get("intent") || params.get("servicio") || "";
  }

  function bindIntentFromCtas(form) {
    document.addEventListener("click", function (e) {
      const link = e.target.closest('a[href*="#contacto-form"], a[href*="#contacto"]');
      if (!link) return;
      const track = link.getAttribute("data-track") || "";
      const intent = TRACK_INTENT[track] || link.getAttribute("data-form-intent") || "";
      if (intent) {
        window.setTimeout(function () {
          setIntent(form, intent);
        }, 50);
      }
    });
  }

  function showSuccessPanel(form, data) {
    const fields = form.querySelector(".contact-form-fields");
    const panel = form.querySelector(".contact-success");
    if (!fields || !panel) return;

    const intent = data.get("intent") || "diagnostico";
    const copy = copyForIntent(intent === "diagnostico" ? "diagnostico" : "default");
    const calUrl = calendarUrl(intent);
    const hasCalendar = calendarEnabled(intent);
    const waUrl = whatsAppUrl(buildVisitorWhatsApp(data));

    const titleEl = panel.querySelector(".contact-success__title");
    const leadEl = panel.querySelector(".contact-success__lead");
    const calBtn = panel.querySelector("[data-action='calendar']");
    const waBtn = panel.querySelector("[data-action='whatsapp']");
    const noteEl = panel.querySelector(".contact-success__note");

    if (titleEl) titleEl.textContent = copy.successTitle;
    if (leadEl) {
      leadEl.textContent = hasCalendar
        ? "Tu información ya está con Land Advisors. Elige horario en el calendario o confirma por WhatsApp — lo que te resulte más cómodo."
        : "Tu información ya está con Land Advisors. Confirma por WhatsApp para coordinar la reunión en los próximos minutos.";
    }

    if (calBtn) {
      if (hasCalendar) {
        calBtn.href = calUrl;
        calBtn.hidden = false;
      } else {
        calBtn.hidden = true;
      }
    }

    if (waBtn) {
      waBtn.href = waUrl;
      const waLabel = waBtn.querySelector("[data-wa-label]");
      waBtn.classList.toggle("contact-success__btn-whatsapp--primary", !hasCalendar);
      if (waLabel) {
        waLabel.textContent = hasCalendar
          ? "Confirmar por WhatsApp"
          : "Abrir WhatsApp y coordinar reunión";
      }
    }

    if (noteEl) {
      noteEl.textContent =
        "Reunión ~30 min · Online o presencial en Puerto Varas · Respondemos en horario laboral (lun–vie).";
    }

    fields.hidden = true;
    panel.hidden = false;
    form.dataset.state = "success";

    if (typeof window.LA_track === "function") {
      window.LA_track("form_success", {
        form_intent: intent,
        has_calendar: hasCalendar,
        page_path: location.pathname,
      });
    }

    window.setTimeout(function () {
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  function initForm(form) {
    const urlIntent = readIntentFromUrl();
    if (urlIntent) setIntent(form, urlIntent);
    else applyFormCopy(form, form.querySelector('[name="intent"]')?.value || "diagnostico");

    form.querySelector('[name="intent"]')?.addEventListener("change", function (e) {
      applyFormCopy(form, e.target.value || "diagnostico");
    });

    bindIntentFromCtas(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get("website")) return;

      const intent = data.get("intent") || "";
      const message = buildMessage(data);

      if (typeof window.LA_track === "function") {
        window.LA_track("form_submit", { form_intent: intent, page_path: location.pathname });
      }

      const cfg = whatsappConfig();
      const webhookUrl = (cfg.webhookUrl || "").trim();
      const apiKey = (cfg.apiKey || "").trim();
      const autoSend = cfg.enabled && (webhookUrl || apiKey);

      if (!autoSend) {
        showSuccessPanel(form, data);
        window.open(whatsAppUrl(message), "_blank", "noopener,noreferrer");
        return;
      }

      setSubmitting(form, true);
      setStatus(form, "", "");

      sendAutoWhatsApp(message)
        .then(function () {
          showSuccessPanel(form, data);
        })
        .catch(function () {
          showSuccessPanel(form, data);
          setStatus(
            form,
            "Recibimos tu datos en pantalla. Si no ves el calendario, usa WhatsApp para confirmar la reunión.",
            "info"
          );
        })
        .finally(function () {
          setSubmitting(form, false);
        });
    });
  }

  document.querySelectorAll(".contact-form").forEach(initForm);
})();
