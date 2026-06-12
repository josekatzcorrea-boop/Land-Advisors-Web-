/**
 * Land Advisors — analítica (GA4, GTM, Meta Pixel)
 * Activar en analytics-config.js con IDs reales.
 */
(function () {
  const cfg = window.LA_ANALYTICS || { enabled: false };

  function log() {
    if (cfg.debug) console.log("[LA Analytics]", ...arguments);
  }

  function injectScript(src, attrs) {
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    if (attrs) Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    document.head.appendChild(s);
  }

  function initGTM() {
    if (!cfg.gtmId) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    injectScript("https://www.googletagmanager.com/gtm.js?id=" + cfg.gtmId);
    log("GTM", cfg.gtmId);
  }

  function initGA4() {
    if (!cfg.ga4MeasurementId) return;
    injectScript("https://www.googletagmanager.com/gtag/js?id=" + cfg.ga4MeasurementId);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.ga4MeasurementId, { anonymize_ip: true, send_page_view: true });
    log("GA4", cfg.ga4MeasurementId);
  }

  function initMetaPixel() {
    if (!cfg.metaPixelId) return;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", cfg.metaPixelId);
    window.fbq("track", "PageView");
    log("Meta Pixel", cfg.metaPixelId);
  }

  window.LA_track = function (eventName, params) {
    params = params || {};
    log("event", eventName, params);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, params));
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
    if (typeof window.fbq === "function") {
      const map = {
        cta_diagnostico: "Lead",
        cta_busqueda: "Lead",
        cta_estudio: "Lead",
        cta_estructuracion: "Lead",
        cta_contacto: "Contact",
        cta_whatsapp: "Contact",
        form_submit: "Lead",
      };
      if (map[eventName]) window.fbq("track", map[eventName], params);
    }
  };

  if (!cfg.enabled) {
    log("disabled — set LA_ANALYTICS.enabled = true in analytics-config.js");
    return;
  }

  initGTM();
  initGA4();
  initMetaPixel();
})();
