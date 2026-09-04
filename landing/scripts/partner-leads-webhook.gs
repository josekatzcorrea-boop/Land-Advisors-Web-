/**
 * Land Advisors — Partner Leads → Google Sheets + email (Iterrasur)
 *
 * Hoja destino:
 * https://docs.google.com/spreadsheets/d/1XdNVyeCK_55Sqm8fk3WYyg1hLuaBwINWnvBUrLENmpI/edit
 *
 * ── Instalación / actualización (5 min) ──
 * 1. Abre la hoja de cálculo arriba → Extensiones → Apps Script
 * 2. Reemplaza Code.gs con TODO este archivo
 * 3. Guardar (Ctrl+S)
 * 4. Implementar → Nueva implementación (o Gestionar → Editar) → Aplicación web
 *      Ejecutar como: Yo
 *      Acceso: Cualquiera
 * 5. Copia la URL que termina en /exec
 * 6. Pégala en landing/partner-leads-config.js → webhookUrl
 * 7. Prueba en el navegador: TU-URL/exec?test=1
 * 8. Prueba email: TU-URL/exec?test=1&email=1  (envía correo de prueba a Iterrasur)
 *
 * Nota: tras cada cambio de este archivo hay que crear una NUEVA versión
 * de la implementación web para que el /exec use el código actualizado.
 */

var SPREADSHEET_ID = "1XdNVyeCK_55Sqm8fk3WYyg1hLuaBwINWnvBUrLENmpI";

/**
 * Destinatarios por partner.
 * Enviar por separado (no CC en el mismo mensaje): si un dominio bloquea,
 * no tumba el correo del otro. contacto@landadvisors.cl funciona como TO
 * único; falla a veces si va en CC con otro destinatario.
 */
var PARTNER_EMAIL_ROUTES = {
  iterrasur: {
    to: "barbarafonseca83@gmail.com",
    alsoTo: "contacto@landadvisors.cl",
    label: "Iterrasur",
  },
};

var HEADERS = [
  "fecha",
  "nombre",
  "email",
  "telefono",
  "ciudad",
  "comentario",
  "partner",
  "source",
];

function getLeadsSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheets()[0];
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var hasHeaders = firstRow[0] === "fecha" && firstRow[1] === "nombre";
  if (!hasHeaders) {
    sheet.insertRowsBefore(1, 1);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function appendLead_(data) {
  var sheet = getLeadsSheet_();
  sheet.appendRow([
    data.fecha || new Date().toISOString(),
    data.nombre || "",
    data.email || "",
    data.telefono || "",
    data.ciudad || "",
    data.comentario || "",
    data.partner || "",
    data.source || "Land Advisors Website",
  ]);
}

function normalizePartnerKey_(data) {
  var raw = String(data.partnerId || data.partner || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
  if (raw.indexOf("terrasur") !== -1 || raw.indexOf("iterrasur") !== -1) {
    return "iterrasur";
  }
  return raw;
}

function resolveEmailRoute_(data) {
  var key = normalizePartnerKey_(data);
  return PARTNER_EMAIL_ROUTES[key] || null;
}

function buildLeadEmailBody_(data, route) {
  var lines = [
    "Nuevo lead desde Land Advisors Chile — alianza " + (route.label || data.partner || "") + ".",
    "",
    "Nombre: " + (data.nombre || ""),
    "Correo: " + (data.email || ""),
    "Teléfono: " + (data.telefono || ""),
    data.ciudad ? "Ciudad: " + data.ciudad : "",
    "",
    "Necesidad / comentario:",
    data.comentario || "(sin comentario)",
    "",
    "Partner: " + (data.partner || ""),
    "Fuente: " + (data.source || "Land Advisors Website"),
    "Fecha: " + (data.fecha || new Date().toISOString()),
    "",
    "—",
    "Este correo se genera automáticamente al completar el formulario de alianzas en landadvisors.cl",
  ];
  return lines.filter(function (line, i, arr) {
    if (line === "" && arr[i - 1] === "") return false;
    return true;
  }).join("\n");
}

/**
 * Dos envíos independientes (sin CC):
 * 1) Bárbara Gmail
 * 2) contacto@landadvisors.cl
 * Así un bloqueo no anula al otro.
 */
function notifyPartnerEmail_(data) {
  var route = resolveEmailRoute_(data);
  if (!route || !route.to) return { sent: false, reason: "no_route" };

  var subject =
    "Nuevo lead Land Advisors → " +
    (route.label || data.partner || "Partner") +
    ": " +
    (data.nombre || "Sin nombre");
  var body = buildLeadEmailBody_(data, route);
  var replyTo = data.email || "contacto@landadvisors.cl";
  var results = { sent: true, recipients: [] };

  function sendOne_(address) {
    try {
      MailApp.sendEmail({
        to: address,
        subject: subject,
        body: body,
        replyTo: replyTo,
        name: "Land Advisors Chile",
      });
      results.recipients.push({ to: address, ok: true });
    } catch (err) {
      results.recipients.push({ to: address, ok: false, error: String(err) });
    }
  }

  sendOne_(route.to);
  if (route.alsoTo && route.alsoTo !== route.to) {
    sendOne_(route.alsoTo);
  }

  return results;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || "{}";
    var data = JSON.parse(raw);
    appendLead_(data);

    var emailResult = { sent: false };
    try {
      emailResult = notifyPartnerEmail_(data);
    } catch (mailErr) {
      emailResult = { sent: false, error: String(mailErr) };
    }

    return jsonResponse_({ ok: true, email: emailResult });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/** Prueba rápida: abrir en el navegador …/exec?test=1  ·  email: …/exec?test=1&email=1 */
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.test === "1") {
      var sample = {
        fecha: new Date().toISOString(),
        nombre: "Prueba webhook",
        email: "test@landadvisors.cl",
        telefono: "+56900000000",
        ciudad: "",
        comentario: "Fila de prueba desde Apps Script",
        partner: "Iterrasur",
        partnerId: "iterrasur",
        source: "Land Advisors Website (test)",
      };
      appendLead_(sample);

      var emailResult = { sent: false, reason: "skipped" };
      if (e.parameter.email === "1") {
        try {
          emailResult = notifyPartnerEmail_(sample);
        } catch (mailErr) {
          emailResult = { sent: false, error: String(mailErr) };
        }
      }

      return jsonResponse_({
        ok: true,
        message: "Fila de prueba agregada",
        email: emailResult,
      });
    }
    return jsonResponse_({ ok: true, message: "Partner leads webhook activo" });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/** Ejecutar una vez desde el editor para autorizar MailApp */
function autorizarEnvioCorreo() {
  MailApp.sendEmail({
    to: "contacto@landadvisors.cl",
    subject: "Land Advisors — autorización correo partners OK",
    body: "Permiso de envío de correo activado correctamente.",
  });
}
