/**
 * Land Advisors — landing de campaña (calendario + WhatsApp + CTAs flotantes)
 */
(function () {
  const root = document.documentElement;
  const waIntro = root.getAttribute("data-wa-intro") || "";
  const waToken = root.getAttribute("data-wa-token") || "LA-CAMP";
  const phone = (root.getAttribute("data-wa-phone") || "56999163518").replace(/\D/g, "");
  const calendarIntent = root.getAttribute("data-calendar-intent") || "diagnostico";

  function calendarUrl() {
    const cfg = window.LA_CALENDAR || {};
    if (!cfg.enabled || !cfg.url) return "";
    return cfg.events?.[calendarIntent] || cfg.url;
  }

  function buildWhatsAppHref() {
    const params = new URLSearchParams(location.search);
    const parts = [waIntro, "[Ref: " + waToken + "]"];
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

  function init() {
    wireCtas();
    initFloatCtas();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
