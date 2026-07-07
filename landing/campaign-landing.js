/**
 * Land Advisors — landing de campaña (WhatsApp prellenado + calendario)
 */
(function () {
  const root = document.documentElement;
  const waIntro = root.getAttribute("data-wa-intro") || "";
  const phone = "56974533265";

  function calendarUrl() {
    const cfg = window.LA_CALENDAR || {};
    if (!cfg.enabled || !cfg.url) return "";
    return cfg.events?.busqueda || cfg.url;
  }

  function buildWhatsAppHref() {
    const params = new URLSearchParams(location.search);
    const parts = [waIntro];
    const utm = ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
      .map((k) => params.get(k))
      .filter(Boolean);
    if (utm.length) {
      parts.push("(Ref: " + utm.join(" / ") + ")");
    }
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(parts.filter(Boolean).join("\n\n"));
  }

  function wireCtas() {
    const waHref = buildWhatsAppHref();
    document.querySelectorAll("[data-campaign-wa]").forEach((el) => {
      el.setAttribute("href", waHref);
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireCtas);
  } else {
    wireCtas();
  }
})();
