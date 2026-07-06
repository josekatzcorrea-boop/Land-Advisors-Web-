/**
 * Configuración de analítica — copiar a analytics-config.js y completar IDs.
 * analytics-config.js está en .gitignore si contiene IDs reales.
 *
 * SEO: tras crear GA4, vincular con Search Console (search.google.com/search-console).
 * Verificación GSC: pegar código en landing/seo/site.json → seo.googleSiteVerification y redeploy.
 */
window.LA_ANALYTICS = {
  enabled: false,
  gtmId: "", // GTM-XXXXXXX (opcional)
  ga4MeasurementId: "G-F09P7G5WZK", // Land Advisors Web — GA4
  metaPixelId: "1067824015463958", // Land Advisors Chile — Events Manager
  googleAdsConversionId: "", // AW-XXXXXXXXX
  debug: false,
};
