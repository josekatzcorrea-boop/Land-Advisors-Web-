/**
 * Land Advisors — Proxy CallMeBot (WhatsApp)
 *
 * Desplegar como Aplicación web:
 *   Ejecutar como: Yo
 *   Acceso: Cualquiera
 *
 * Script Properties (Proyecto → Configuración del proyecto → Propiedades del script):
 *   LA_CALLMEBOT_APIKEY  — API key de CallMeBot
 *   LA_CALLMEBOT_PHONE   — Teléfono destino sin + (ej. 56974533265)
 *
 * Si no defines propiedades, usa los defaults de abajo (solo desarrollo).
 */

var DEFAULT_PHONE = "56974533265";
var DEFAULT_APIKEY = "6937799";

function getConfig_() {
  var props = PropertiesService.getScriptProperties();
  var phone = (props.getProperty("LA_CALLMEBOT_PHONE") || DEFAULT_PHONE).replace(/\s+/g, "").replace(/^\+/, "");
  var apiKey = (props.getProperty("LA_CALLMEBOT_APIKEY") || DEFAULT_APIKEY).trim();
  return { phone: phone, apiKey: apiKey };
}

function sendMessage_(text) {
  var cfg = getConfig_();
  if (!cfg.apiKey) {
    throw new Error("Falta LA_CALLMEBOT_APIKEY en Script Properties");
  }
  if (!cfg.phone) {
    throw new Error("Falta LA_CALLMEBOT_PHONE en Script Properties");
  }

  text = String(text || "").trim();
  if (!text) {
    throw new Error("Texto vacío");
  }

  var url =
    "https://api.callmebot.com/whatsapp.php?phone=" +
    encodeURIComponent(cfg.phone) +
    "&text=" +
    encodeURIComponent(text) +
    "&apikey=" +
    encodeURIComponent(cfg.apiKey);

  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var code = resp.getResponseCode();
  var body = resp.getContentText();

  if (code !== 200) {
    throw new Error("CallMeBot HTTP " + code + ": " + body.substring(0, 200));
  }
  return body;
}

/** Respuesta text/plain para evitar preflight CORS desde el navegador. */
function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  try {
    var text = (e && e.parameter && e.parameter.text) || "";
    var result = sendMessage_(text);
    return respond_({ ok: true, result: result });
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    var text = "";
    if (e && e.postData && e.postData.contents) {
      var raw = e.postData.contents;
      if (raw.charAt(0) === "{") {
        var payload = JSON.parse(raw);
        text = payload.text || payload.message || "";
      } else {
        text = raw;
      }
    }
    var result = sendMessage_(text);
    return respond_({ ok: true, result: result });
  } catch (err) {
    return respond_({ ok: false, error: String(err.message || err) });
  }
}
