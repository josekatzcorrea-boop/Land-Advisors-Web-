/**
 * Land Advisors — analítica (GA4, GTM, Meta Pixel)
 * Activar en analytics-config.js con IDs reales.
 */
(function () {
  const cfg = window.LA_ANALYTICS || { enabled: false };

  const GA4_STANDARD_EVENTS = {
    cta_diagnostico: "generate_lead",
    cta_busqueda: "generate_lead",
    cta_estudio: "generate_lead",
    cta_estructuracion: "generate_lead",
    cta_contacto: "generate_lead",
    cta_whatsapp: "generate_lead",
    cta_calendar: "generate_lead",
    form_submit: "generate_lead",
    form_success: "generate_lead",
    partner_lead_submit: "generate_lead",
    partner_redirect: "generate_lead",
  };

  window.LA_getUtmParams = function () {
    const q = new URLSearchParams(location.search);
    return {
      utm_source: q.get("utm_source") || "",
      utm_medium: q.get("utm_medium") || "",
      utm_campaign: q.get("utm_campaign") || "",
      utm_content: q.get("utm_content") || "",
    };
  };

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
    const urlDebug = new URLSearchParams(location.search).has("la_debug");
    const debugMode = Boolean(cfg.debug || urlDebug);
    injectScript("https://www.googletagmanager.com/gtag/js?id=" + cfg.ga4MeasurementId);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.ga4MeasurementId, {
      anonymize_ip: true,
      send_page_view: true,
      debug_mode: debugMode,
      allow_google_signals: true,
    });
    log("GA4", cfg.ga4MeasurementId, debugMode ? "(debug_mode)" : "");
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

    if (!document.getElementById("la-meta-pixel-noscript")) {
      const noscript = document.createElement("noscript");
      noscript.id = "la-meta-pixel-noscript";
      const img = document.createElement("img");
      img.height = 1;
      img.width = 1;
      img.style.display = "none";
      img.alt = "";
      img.src =
        "https://www.facebook.com/tr?id=" + encodeURIComponent(cfg.metaPixelId) + "&ev=PageView&noscript=1";
      noscript.appendChild(img);
      document.body.appendChild(noscript);
    }

    log("Meta Pixel", cfg.metaPixelId);
  }

  window.LA_track = function (eventName, params) {
    params = params || {};
    const utm = LA_getUtmParams();
    const payload = Object.assign(
      {
        page_path: params.page_path || location.pathname,
        page_location: location.href,
        campaign_source: utm.utm_source,
        campaign_medium: utm.utm_medium,
        campaign_name: utm.utm_campaign,
        campaign_content: utm.utm_content,
      },
      params
    );
    log("event", eventName, payload);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, payload));

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
      const ga4Standard = cfg.ga4StandardEvents || GA4_STANDARD_EVENTS;
      const standardName = ga4Standard[eventName];
      if (standardName) {
        window.gtag("event", standardName, Object.assign({}, payload, {
          la_event: eventName,
          lead_source: eventName,
        }));
      }
    }

    if (typeof window.fbq === "function") {
      const map = {
        cta_diagnostico: "Lead",
        cta_busqueda: "Lead",
        cta_estudio: "Lead",
        cta_estructuracion: "Lead",
        cta_contacto: "Contact",
        cta_whatsapp: "Contact",
        cta_calendar: "Schedule",
        form_submit: "Lead",
        form_success: "Lead",
        partner_view: "ViewContent",
        partner_form_open: "InitiateCheckout",
        partner_lead_submit: "Lead",
        partner_redirect: "Lead",
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
