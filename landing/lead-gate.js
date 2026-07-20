/**
 * Lead gate — todo CTA WhatsApp / calendario pasa por formulario primero.
 * Intercepta: data-site-wa|calendar, data-campaign-wa|calendar, chat FAB.
 * Excepciones: #contacto-form, #campaign-lead, paneles de éxito post-formulario.
 */
(function () {
  const DEFAULT_PHONE = "56974533265";
  const CAL_FALLBACK = "https://calendar.app.google/NnBG8xc4b2HbByu67";

  const OBJETIVO_LABELS = {
    vivir: "Vivir / calidad de vida",
    segunda: "Segunda vivienda",
    inversion: "Inversión patrimonial",
    proyecto: "Proyecto (cabañas, comercio u otro)",
    otro: "Otro / aún lo estoy definiendo",
  };

  const PRESUPUESTO_LABELS = {
    "1500-2500": "1.500 a 2.500 UF",
    "2500-3500": "2.500 a 3.500 UF",
    "3500-4500": "3.500 a 4.500 UF",
    "sobre-5000": "Sobre 5.000 UF",
  };

  const GATE_SELECTORS = [
    "[data-site-wa]",
    "[data-site-calendar]",
    "[data-campaign-wa]",
    "[data-campaign-calendar]",
    "a.btn-cta-wa",
    "a.btn-cta-agenda",
    "a.nav-cta--wa",
    "a.nav-cta--cal",
    "a.campaign-cta--wa",
    "a.campaign-cta--cal",
    "a.la-chat-widget__btn",
  ].join(",");

  let pendingAction = "whatsapp";
  let dialog = null;
  let lastLead = null;

  function phoneDigits() {
    const root = document.documentElement;
    const fromRoot = (root.getAttribute("data-wa-phone") || "").replace(/\D/g, "");
    const fromCfg = String((window.LA_WHATSAPP && window.LA_WHATSAPP.phone) || "").replace(/\D/g, "");
    return fromRoot || fromCfg || DEFAULT_PHONE;
  }

  function calendarHref() {
    const cfg = window.LA_CALENDAR || {};
    if (!cfg.enabled) return "";
    const intent =
      document.documentElement.getAttribute("data-calendar-intent") || "diagnostico";
    return (cfg.events && cfg.events[intent]) || cfg.url || CAL_FALLBACK;
  }

  function isExemptHref(href) {
    return /#(contacto-form|contacto|campaign-lead)\b/i.test(href || "");
  }

  function isPostFormSuccess(el) {
    return Boolean(
      el.closest(".contact-success") ||
        el.closest(".campaign-lead-success") ||
        el.closest("#lead-gate-success")
    );
  }

  function actionFromEl(el) {
    if (
      el.matches(
        "[data-site-wa],[data-campaign-wa],.btn-cta-wa,.nav-cta--wa,.campaign-cta--wa,.la-chat-widget__btn"
      )
    ) {
      return "whatsapp";
    }
    return "calendar";
  }

  function buildNotifyText(data) {
    return [
      "*Lead web — Land Advisors*",
      "",
      "Nombre: " + data.nombre,
      "Correo: " + data.email,
      "Teléfono: " + data.telefono,
      "Objetivo: " + (OBJETIVO_LABELS[data.objetivo] || data.objetivo),
      "Presupuesto: " + (PRESUPUESTO_LABELS[data.presupuesto] || data.presupuesto),
      "Quiere: " + (data.action === "calendar" ? "Agendar diagnóstico" : "WhatsApp"),
      "",
      "Página: " + location.pathname + location.search,
    ].join("\n");
  }

  function buildVisitorWa(data) {
    const intro =
      document.documentElement.getAttribute("data-wa-intro") ||
      "Hola, completé el formulario en landadvisors.cl y quiero conversar.";
    const token = document.documentElement.getAttribute("data-wa-token") || "LA-WEB";
    const text = [
      intro,
      "",
      "Soy " + data.nombre + ".",
      "Objetivo: " + (OBJETIVO_LABELS[data.objetivo] || data.objetivo) + ".",
      "Presupuesto: " + (PRESUPUESTO_LABELS[data.presupuesto] || data.presupuesto) + ".",
      "Teléfono: " + data.telefono + ".",
      "Correo: " + data.email + ".",
      "",
      "[Ref: " + token + "]",
    ].join("\n");
    return "https://wa.me/" + phoneDigits() + "?text=" + encodeURIComponent(text);
  }

  function notifyWebhook(text) {
    const wa = window.LA_WHATSAPP || {};
    const url = (wa.webhookUrl || "").trim();
    if (!wa.enabled || !url) return Promise.resolve();
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
      mode: "no-cors",
      keepalive: true,
    }).catch(function () {});
  }

  function ensureModal() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.id = "lead-gate-modal";
    dialog.className = "lead-gate";
    dialog.setAttribute("aria-labelledby", "lead-gate-title");
    dialog.innerHTML =
      '<div class="lead-gate__panel">' +
      '<button type="button" class="lead-gate__close" data-lead-gate-close aria-label="Cerrar">&times;</button>' +
      '<div class="lead-gate__form-wrap" id="lead-gate-form-wrap">' +
      '<p class="lead-gate__kicker">Land Advisors</p>' +
      '<h2 class="lead-gate__title" id="lead-gate-title">Antes de continuar</h2>' +
      '<p class="lead-gate__intro" id="lead-gate-intro">Cuéntanos quién eres y qué buscas. Luego te abrimos WhatsApp o el calendario.</p>' +
      '<form class="lead-gate__form" id="lead-gate-form" novalidate>' +
      '<label for="lg-nombre">Nombre</label>' +
      '<input type="text" id="lg-nombre" name="nombre" required autocomplete="name" placeholder="Tu nombre">' +
      '<label for="lg-email">Correo</label>' +
      '<input type="email" id="lg-email" name="email" required autocomplete="email" placeholder="tunombre@correo.cl">' +
      '<label for="lg-telefono">Teléfono / WhatsApp</label>' +
      '<input type="tel" id="lg-telefono" name="telefono" required autocomplete="tel" placeholder="+56 9 …">' +
      '<label for="lg-objetivo">Objetivo de compra</label>' +
      '<select id="lg-objetivo" name="objetivo" required>' +
      '<option value="">Seleccionar…</option>' +
      '<option value="vivir">Vivir / calidad de vida</option>' +
      '<option value="segunda">Segunda vivienda</option>' +
      '<option value="inversion">Inversión patrimonial</option>' +
      '<option value="proyecto">Proyecto (cabañas, comercio u otro)</option>' +
      '<option value="otro">Otro / aún lo estoy definiendo</option>' +
      "</select>" +
      '<label for="lg-presupuesto">Rango de presupuesto</label>' +
      '<select id="lg-presupuesto" name="presupuesto" required>' +
      '<option value="">Seleccionar en UF…</option>' +
      '<option value="1500-2500">1.500 a 2.500 UF</option>' +
      '<option value="2500-3500">2.500 a 3.500 UF</option>' +
      '<option value="3500-4500">3.500 a 4.500 UF</option>' +
      '<option value="sobre-5000">Sobre 5.000 UF</option>' +
      "</select>" +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="lead-gate__hp">' +
      '<button type="submit" class="lead-gate__submit btn btn-primary btn-glow">Continuar</button>' +
      '<p class="lead-gate__hint">No compartimos tus datos. Solo Land Advisors te contactará.</p>' +
      '<p class="lead-gate__status" role="status" aria-live="polite" hidden></p>' +
      "</form></div>" +
      '<div class="lead-gate__success" id="lead-gate-success" hidden>' +
      '<p class="lead-gate__kicker">Listo</p>' +
      '<h2 class="lead-gate__title">Gracias. Ya tenemos tus datos</h2>' +
      '<p class="lead-gate__intro" id="lead-gate-success-lead">Te abrimos el siguiente paso.</p>' +
      '<div class="lead-gate__success-actions">' +
      '<a href="#" class="btn btn-cta-wa" id="lead-gate-go-wa" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>' +
      '<a href="#" class="btn btn-primary btn-glow btn-cta-agenda" id="lead-gate-go-cal" target="_blank" rel="noopener noreferrer">Agendar diagnóstico</a>' +
      "</div>" +
      '<button type="button" class="lead-gate__text-close" data-lead-gate-close>Cerrar</button>' +
      "</div></div>";

    document.body.appendChild(dialog);

    dialog.querySelectorAll("[data-lead-gate-close]").forEach(function (btn) {
      btn.addEventListener("click", close);
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) close();
    });
    dialog.addEventListener("cancel", function (e) {
      e.preventDefault();
      close();
    });

    dialog.querySelector("#lead-gate-form").addEventListener("submit", onSubmit);
    return dialog;
  }

  function setCopy(action) {
    const title = document.getElementById("lead-gate-title");
    const intro = document.getElementById("lead-gate-intro");
    const submit = dialog && dialog.querySelector(".lead-gate__submit");
    if (action === "calendar") {
      if (title) title.textContent = "Antes de agendar tu diagnóstico";
      if (intro)
        intro.textContent =
          "Déjanos tu nombre, contacto, objetivo y presupuesto. Luego eliges horario en el calendario.";
      if (submit) submit.textContent = "Continuar a agendar";
    } else {
      if (title) title.textContent = "Antes de escribir por WhatsApp";
      if (intro)
        intro.textContent =
          "Déjanos tu nombre, contacto, objetivo y presupuesto. Luego te abrimos WhatsApp con José.";
      if (submit) submit.textContent = "Continuar a WhatsApp";
    }
  }

  function open(action) {
    pendingAction = action === "calendar" ? "calendar" : "whatsapp";

    // Si ya dejó datos en esta sesión, abrir destino directo
    try {
      const raw = sessionStorage.getItem("la_lead_gate");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.nombre && saved.email) {
          lastLead = saved;
          lastLead.action = pendingAction;
          ensureModal();
          showSuccess(lastLead);
          if (typeof dialog.showModal === "function") dialog.showModal();
          else dialog.setAttribute("open", "");
          document.body.classList.add("lead-gate-open");
          return;
        }
      }
    } catch (_) {}

    ensureModal();
    setCopy(pendingAction);

    const formWrap = document.getElementById("lead-gate-form-wrap");
    const success = document.getElementById("lead-gate-success");
    const form = document.getElementById("lead-gate-form");
    const status = dialog.querySelector(".lead-gate__status");

    if (formWrap) formWrap.hidden = false;
    if (success) success.hidden = true;
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }
    if (form && !lastLead) form.reset();

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");

    document.body.classList.add("lead-gate-open");
    window.setTimeout(function () {
      const first = dialog.querySelector("#lg-nombre");
      if (first) first.focus();
    }, 50);

    if (typeof window.LA_track === "function") {
      window.LA_track("lead_gate_open", {
        gate_action: pendingAction,
        page_path: location.pathname,
      });
    }
  }

  function close() {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("lead-gate-open");
  }

  function setSubmitting(on) {
    const btn = dialog && dialog.querySelector(".lead-gate__submit");
    if (!btn) return;
    if (on) {
      if (!btn.dataset.label) btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Enviando…";
    } else {
      btn.disabled = false;
      if (btn.dataset.label) btn.textContent = btn.dataset.label;
    }
  }

  function showSuccess(data) {
    const formWrap = document.getElementById("lead-gate-form-wrap");
    const success = document.getElementById("lead-gate-success");
    const lead = document.getElementById("lead-gate-success-lead");
    const waBtn = document.getElementById("lead-gate-go-wa");
    const calBtn = document.getElementById("lead-gate-go-cal");
    const waHref = buildVisitorWa(data);
    const calHref = calendarHref() || CAL_FALLBACK;

    if (formWrap) formWrap.hidden = true;
    if (success) success.hidden = false;

    if (waBtn) waBtn.href = waHref;
    if (calBtn) calBtn.href = calHref;

    if (data.action === "calendar") {
      if (lead)
        lead.textContent =
          "Te abrimos el calendario para elegir horario. También puedes escribir por WhatsApp si prefieres.";
      try {
        window.open(calHref, "_blank", "noopener,noreferrer");
      } catch (_) {}
    } else {
      if (lead)
        lead.textContent =
          "Te abrimos WhatsApp con tu mensaje listo. También puedes agendar diagnóstico en el calendario.";
      try {
        window.open(waHref, "_blank", "noopener,noreferrer");
      } catch (_) {}
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    if (fd.get("website")) return;

    const data = {
      nombre: String(fd.get("nombre") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      telefono: String(fd.get("telefono") || "").trim(),
      objetivo: String(fd.get("objetivo") || ""),
      presupuesto: String(fd.get("presupuesto") || ""),
      action: pendingAction,
    };

    if (!data.nombre || !data.email || !data.telefono || !data.objetivo || !data.presupuesto) {
      form.reportValidity();
      return;
    }

    lastLead = data;
    try {
      sessionStorage.setItem("la_lead_gate", JSON.stringify(data));
    } catch (_) {}
    setSubmitting(true);

    if (typeof window.LA_track === "function") {
      window.LA_track("form_submit", {
        form_intent: "lead_gate",
        gate_action: pendingAction,
        page_path: location.pathname,
      });
    }

    notifyWebhook(buildNotifyText(data)).finally(function () {
      if (typeof window.LA_track === "function") {
        window.LA_track("form_success", {
          form_intent: "lead_gate",
          gate_action: pendingAction,
          objetivo: data.objetivo,
          presupuesto: data.presupuesto,
          page_path: location.pathname,
        });
      }
      setSubmitting(false);
      showSuccess(data);
    });
  }

  function onDocumentClick(e) {
    const el = e.target.closest(GATE_SELECTORS);
    if (!el) return;
    if (el.closest("#lead-gate-modal")) return;
    if (isPostFormSuccess(el)) return;

    const href = el.getAttribute("href") || "";
    if (isExemptHref(href)) return;

    e.preventDefault();
    e.stopPropagation();
    open(actionFromEl(el));
  }

  function init() {
    ensureModal();
    document.addEventListener("click", onDocumentClick, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.LA_LeadGate = {
    open: open,
    close: close,
  };
})();
