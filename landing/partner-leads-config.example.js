/**
 * Persistencia de leads de partners — copiar a partner-leads-config.js
 *
 * Google Sheet (Partner Leads):
 * https://docs.google.com/spreadsheets/d/1XdNVyeCK_55Sqm8fk3WYyg1hLuaBwINWnvBUrLENmpI/edit
 *
 * Activar webhook:
 * 1. En la hoja → Extensiones → Apps Script
 * 2. Pegar landing/scripts/partner-leads-webhook.gs
 * 3. Implementar → Aplicación web → Ejecutar como: Yo · Acceso: Cualquiera
 * 4. Copiar URL /exec abajo en webhookUrl
 * 5. Probar: https://TU-URL/exec?test=1 (debe aparecer una fila de prueba)
 */
window.LA_PARTNER_LEADS = {
  /** URL del webhook (Google Apps Script → Google Sheets) */
  webhookUrl: "",
  /** ID de referencia (no usado en runtime; documentación) */
  spreadsheetId: "1XdNVyeCK_55Sqm8fk3WYyg1hLuaBwINWnvBUrLENmpI",
  storageKey: "la_partner_leads",
  notifyWhatsApp: true,
};
