/**
 * Land Advisors — analítica en producción
 * GA4 / GTM / Google Ads: completar cuando estén creados.
 */
window.LA_ANALYTICS = {
  enabled: true,
  gtmId: "",
  ga4MeasurementId: "G-F09P7G5WZK",
  metaPixelId: "1067824015463958",
  googleAdsConversionId: "",
  debug: false,
  /** Eventos custom → estándar GA4 (marcar generate_lead como conversión en Admin) */
  ga4ConversionEvents: [
    "generate_lead",
    "cta_busqueda",
    "cta_diagnostico",
    "cta_contacto",
    "form_success",
  ],
};
