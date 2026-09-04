/**
 * Formulario Patagonia Land Hunter — land search brief
 */
(function () {
  "use strict";

  var form = document.getElementById("plh-land-search-form");
  if (!form) return;

  var successEl = form.querySelector(".plh-form-success");
  var fieldsEl = form.querySelector(".plh-form__fields");
  var submitBtn = form.querySelector('[type="submit"]');
  var waBtn = successEl && successEl.querySelector(".plh-form-success__wa");

  var OBJETIVO_LABELS = {
    "second-home": "Segunda vivienda",
    lifestyle: "Estilo de vida / Relocalización",
    investment: "Inversión patrimonial",
    tourism: "Proyecto turístico",
    conservation: "Conservación",
    other: "Otro",
  };

  var OBJETIVO_LABELS_EN = {
    "second-home": "Second home",
    lifestyle: "Lifestyle / Relocation",
    investment: "Patrimonial investment",
    tourism: "Tourism project",
    conservation: "Conservation",
    other: "Other",
  };

  function isEn() {
    return (window.LA_LANG || document.documentElement.lang || "es") === "en";
  }

  function label(map, value) {
    var v = (value || "").trim();
    if (!v) return "—";
    return map[v] || v;
  }

  function selectedText(name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el || el.tagName !== "SELECT") return "";
    var opt = el.options[el.selectedIndex];
    return opt ? opt.textContent.trim() : "";
  }

  function normalizePhone(phone) {
    return String(phone || "").replace(/\D/g, "");
  }

  function whatsAppBase() {
    var cfg = window.LA_WHATSAPP || {};
    if (cfg.phone) return "https://wa.me/" + normalizePhone(cfg.phone);
    return "https://wa.me/56974533265";
  }

  function buildNotifyText(data) {
    var objetivoMap = isEn() ? OBJETIVO_LABELS_EN : OBJETIVO_LABELS;
    return [
      "*Patagonia Land Hunter — Land Advisors*",
      "",
      "Nombre: " + (data.nombre || "").trim(),
      "Correo: " + (data.email || "").trim(),
      "Teléfono: " + (data.telefono || "").trim(),
      "País: " + (data.pais || "").trim(),
      "Idioma: " + (selectedText("idioma") || data.idioma || "—"),
      "Busca: " + (data.busqueda || "").trim(),
      "Zona: " + (data.region || "").trim(),
      "Objetivo: " + label(objetivoMap, data.objetivo),
      "Presupuesto: " + (data.presupuesto || "—").trim(),
      "Tamaño: " + (data.tamano || "—").trim(),
      "Plazo: " + (data.plazo || "—").trim(),
      "Detalle: " + (data.detalle || "—").trim(),
      "Comprador internacional: " + (data.internacional ? "Sí" : "No"),
      "",
      "Página: " + location.href,
    ].join("\n");
  }

  function buildVisitorWa(data) {
    var objetivoMap = isEn() ? OBJETIVO_LABELS_EN : OBJETIVO_LABELS;
    var intro = isEn()
      ? "Hi José, I just submitted the Patagonia Land Hunter form on landadvisors.cl."
      : "Hola José, acabo de completar el formulario Patagonia Land Hunter en landadvisors.cl.";
    return [
      intro,
      "",
      (isEn() ? "I'm " : "Soy ") + ((data.nombre || "").trim() || "—") + ".",
      (isEn() ? "Looking for: " : "Busco: ") + ((data.busqueda || "").trim() || "—") + ".",
      (isEn() ? "Objective: " : "Objetivo: ") + label(objetivoMap, data.objetivo) + ".",
      (isEn() ? "Region: " : "Zona: ") + ((data.region || "").trim() || "—") + ".",
      "",
      isEn() ? "Can we talk about next steps? Thanks." : "¿Podemos conversar los próximos pasos? Gracias.",
    ].join("\n");
  }

  function whatsAppUrl(data) {
    var base = whatsAppBase();
    var sep = base.indexOf("?") >= 0 ? "&" : "?";
    return base + sep + "text=" + encodeURIComponent(buildVisitorWa(data));
  }

  function notifyWebhook(text) {
    var wa = window.LA_WHATSAPP || {};
    var url = (wa.webhookUrl || wa.webhook || "").trim();
    if (!wa.enabled || !url) return Promise.resolve({ ok: false, reason: "not_configured" });

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ text: text }),
      keepalive: true,
    })
      .then(function (res) {
        return res.text().then(function (body) {
          try {
            var parsed = JSON.parse(body);
            return { ok: Boolean(parsed && parsed.ok), raw: parsed };
          } catch (_) {
            return { ok: res.ok, raw: body };
          }
        });
      })
      .catch(function () {
        return fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text }),
          mode: "no-cors",
          keepalive: true,
        })
          .then(function () {
            return { ok: true, opaque: true };
          })
          .catch(function () {
            return { ok: false, reason: "network" };
          });
      });
  }

  function setSubmitting(active) {
    if (!submitBtn) return;
    submitBtn.disabled = active;
    submitBtn.setAttribute("aria-busy", active ? "true" : "false");
  }

  function showSuccess(data, webhookResult) {
    if (fieldsEl) fieldsEl.hidden = true;
    if (successEl) successEl.hidden = false;
    if (waBtn) {
      waBtn.href = whatsAppUrl(data);
      waBtn.hidden = false;
    }
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.LA_track) {
      window.LA_track("plh_form_submit", {
        objetivo: data.objetivo,
        webhook_ok: Boolean(webhookResult && (webhookResult.ok || webhookResult.opaque)),
        page_path: location.pathname,
      });
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.querySelector('[name="website"]').value) return;

    var fd = new FormData(form);
    var data = Object.fromEntries(fd.entries());
    data.internacional = form.querySelector('[name="internacional"]').checked;

    setSubmitting(true);
    notifyWebhook(buildNotifyText(data))
      .then(function (result) {
        showSuccess(data, result);
      })
      .finally(function () {
        setSubmitting(false);
      });
  });
})();
