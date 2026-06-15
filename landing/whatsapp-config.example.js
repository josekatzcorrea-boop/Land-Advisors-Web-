/**
 * Envío automático de leads a tu WhatsApp — copiar a whatsapp-config.js
 *
 * ── Activación CallMeBot (una vez) ──
 * 1. Guarda en tus contactos: +34 621 371 153 (nombre: CallMeBot)
 * 2. Abre el chat y envía exactamente: I allow callmebot to send me messages
 * 3. En ~1 min recibirás: "API Activated... Your APIKEY is XXXXX"
 * 4. NO pegues la apiKey aquí si usas el webhook (recomendado).
 *
 * Si no puedes escribir al número: primero agrégalo a contactos, verifica el +34,
 * o pide la apikey por Telegram: @callmebot_com
 *
 * ── Webhook con Google Apps Script (recomendado — evita CORS) ──
 * 1. Abre https://script.google.com → Nuevo proyecto
 * 2. Pega el código de landing/scripts/whatsapp-proxy.gs (borra el Code.gs vacío)
 * 3. Proyecto → Configuración del proyecto → Propiedades del script → Añadir:
 *      LA_CALLMEBOT_APIKEY = tu API key de CallMeBot
 *      LA_CALLMEBOT_PHONE  = 56974533265
 * 4. Implementar → Nueva implementación → Tipo: Aplicación web
 *      Ejecutar como: Yo
 *      Acceso: Cualquiera
 * 5. Copia la URL de implementación (termina en /exec) a webhookUrl abajo
 * 6. Pon enabled: true. La apiKey queda solo en Script Properties, no en el repo.
 *
 * Prueba rápida (navegador): https://TU-URL/exec?text=Prueba
 */
window.LA_WHATSAPP = {
  enabled: false,
  webhookUrl: "",
  phone: "+56974533265",
};
