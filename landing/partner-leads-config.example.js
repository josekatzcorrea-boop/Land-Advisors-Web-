/**
 * Persistencia de leads de partners — copiar a partner-leads-config.js
 *
 * Google Sheet (Partner Leads):
 * https://docs.google.com/spreadsheets/d/1XdNVyeCK_55Sqm8fk3WYyg1hLuaBwINWnvBUrLENmpI/edit
 *
 * Activar / actualizar webhook:
 * 1. En la hoja → Extensiones → Apps Script
 * 2. Pegar landing/scripts/partner-leads-webhook.gs (reemplazar Code.gs)
 * 3. Implementar → Nueva implementación → Aplicación web → Ejecutar como: Yo · Acceso: Cualquiera
 * 4. Copiar URL /exec abajo en webhookUrl
 * 5. Probar fila: https://TU-URL/exec?test=1
 * 6. Probar email Iterrasur: https://TU-URL/exec?test=1&email=1
 *    → bfonseca@iterrasur.cl (CC contacto@landadvisors.cl)
 */
window.LA_PARTNER_LEADS = {
  /** URL del webhook (Google Apps Script → Google Sheets + email partner) */
  webhookUrl: "",
  /** ID de referencia (no usado en runtime; documentación) */
  spreadsheetId: "1XdNVyeCK_55Sqm8fk3WYyg1hLuaBwINWnvBUrLENmpI",
  storageKey: "la_partner_leads",
  notifyWhatsApp: true,
};
