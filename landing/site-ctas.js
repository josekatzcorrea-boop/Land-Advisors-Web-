/**
 * Land Advisors — cablea CTAs WhatsApp + calendario en todo el sitio
 * Usa: data-site-wa | data-site-calendar
 * Opcional en <html>: data-wa-intro, data-wa-phone
 */
(function () {
  const root = document.documentElement;
  const phone = (root.getAttribute("data-wa-phone") || "56974533265").replace(/\D/g, "");
  const intro =
    root.getAttribute("data-wa-intro") ||
    "Hola, quiero agendar un diagnóstico con Land Advisors.";

  function waHref() {
    const params = new URLSearchParams(location.search);
    const parts = [intro, "[Ref: LA-WEB]"];
    const utm = ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
      .map((k) => params.get(k))
      .filter(Boolean);
    if (utm.length) parts.push("(Ref: " + utm.join(" / ") + ")");
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(parts.join("\n\n"));
  }

  function calendarHref() {
    const cfg = window.LA_CALENDAR || {};
    if (!cfg.enabled || !cfg.url) return "";
    const intent = root.getAttribute("data-calendar-intent") || "diagnostico";
    return cfg.events?.[intent] || cfg.url;
  }

  function wire() {
    const wa = waHref();
    document.querySelectorAll("[data-site-wa]").forEach((el) => {
      el.setAttribute("href", wa);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });

    const cal = calendarHref();
    document.querySelectorAll("[data-site-calendar]").forEach((el) => {
      if (cal) {
        el.setAttribute("href", cal);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        el.removeAttribute("aria-disabled");
      } else {
        el.setAttribute("href", "#contacto-form");
        el.removeAttribute("target");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
