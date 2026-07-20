/**
 * Land Advisors — landing de campaña (calendario + WhatsApp + lead form)
 */
(function () {
  const root = document.documentElement;
  const waIntro = root.getAttribute("data-wa-intro") || "";
  const waToken = root.getAttribute("data-wa-token") || "LA-CAMP";
  const phone = (root.getAttribute("data-wa-phone") || "56974533265").replace(/\D/g, "");
  const calendarIntent = root.getAttribute("data-calendar-intent") || "diagnostico";

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

  function calendarUrl() {
    const cfg = window.LA_CALENDAR || {};
    if (!cfg.enabled || !cfg.url) return "";
    return cfg.events?.[calendarIntent] || cfg.url;
  }

  function buildWhatsAppHref(extraLines) {
    const params = new URLSearchParams(location.search);
    const parts = [waIntro];
    if (extraLines && extraLines.length) {
      parts.push(extraLines.filter(Boolean).join("\n"));
    }
    parts.push("[Ref: " + waToken + "]");
    const utm = ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
      .map((k) => params.get(k))
      .filter(Boolean);
    if (utm.length) {
      parts.push("(Ref: " + utm.join(" / ") + ")");
    }
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(parts.filter(Boolean).join("\n\n"));
  }

  function wireCtas(leadWaHref) {
    const waHref = leadWaHref || buildWhatsAppHref();
    document.querySelectorAll("[data-campaign-wa]").forEach((el) => {
      el.setAttribute("href", waHref);
    });
    document.querySelectorAll("[data-campaign-lead-wa]").forEach((el) => {
      el.setAttribute("href", leadWaHref || waHref);
    });

    const cal = calendarUrl();
    document.querySelectorAll("[data-campaign-calendar]").forEach((el) => {
      if (cal) {
        el.setAttribute("href", cal);
        el.removeAttribute("aria-disabled");
      } else {
        el.setAttribute("href", "#");
        el.setAttribute("aria-disabled", "true");
      }
    });
  }

  function initFloatCtas() {
    const float = document.querySelector(".campaign-float-cta");
    const hero = document.querySelector(".campaign-hero");
    if (!float || !hero) return;

    const setVisible = (visible) => {
      float.classList.toggle("is-visible", visible);
      float.hidden = !visible;
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { threshold: 0, rootMargin: "-8% 0px 0px 0px" }
      );
      observer.observe(hero);
    } else {
      const onScroll = () => setVisible(window.scrollY > hero.offsetHeight * 0.55);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
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

  function initLeadForm() {
    const form = document.getElementById("campaign-lead-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const hp = form.querySelector('[name="website"]');
      if (hp && hp.value) return;

      const data = new FormData(form);
      const nombre = (data.get("nombre") || "").trim();
      const email = (data.get("email") || "").trim();
      const objetivo = data.get("objetivo") || "";
      const presupuesto = data.get("presupuesto") || "";

      if (!nombre || !email || !objetivo || !presupuesto) {
        form.reportValidity();
        return;
      }

      const objetivoLabel = OBJETIVO_LABELS[objetivo] || objetivo;
      const presupuestoLabel = PRESUPUESTO_LABELS[presupuesto] || presupuesto;

      const leadLines = [
        "Nombre: " + nombre,
        "Correo: " + email,
        "Objetivo de compra: " + objetivoLabel,
        "Presupuesto: " + presupuestoLabel,
      ];

      const notifyText = [
        "*Lead campaña BUSQ30 — Land Advisors*",
        "",
        ...leadLines,
        "",
        "Página: " + location.pathname,
      ].join("\n");

      const visitorWa = buildWhatsAppHref([
        "Soy " + nombre + ".",
        "Objetivo: " + objetivoLabel + ".",
        "Presupuesto: " + presupuestoLabel + ".",
        "Correo: " + email + ".",
        "Quiero continuar para agendar el diagnóstico gratis.",
      ]);

      if (typeof window.LA_track === "function") {
        window.LA_track("form_success", {
          form_intent: "diagnostico",
          campaign: "BUSQ30",
          objetivo: objetivo,
          presupuesto: presupuesto,
          page_path: location.pathname,
        });
      }

      notifyWebhook(notifyText);

      const fields = form.querySelector(".campaign-lead-form__fields");
      const success = form.querySelector(".campaign-lead-success");
      if (fields) fields.hidden = true;
      if (success) success.hidden = false;

      wireCtas(visitorWa);

      try {
        window.open(visitorWa, "_blank", "noopener,noreferrer");
      } catch (_) {}

      if (success) {
        success.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  function init() {
    wireCtas();
    initFloatCtas();
    initLeadForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
