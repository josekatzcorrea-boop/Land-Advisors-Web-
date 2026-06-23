/**
 * Land Advisors — Partner Leads → Google Sheets
 *
 * Hoja destino:
 * https://docs.google.com/spreadsheets/d/1XdNVyeCK_55Sqm8fk3WYyg1hLuaBwINWnvBUrLENmpI/edit
 *
 * ── Instalación (5 min) ──
 * 1. Abre la hoja de cálculo arriba → Extensiones → Apps Script
 * 2. Borra Code.gs y pega TODO este archivo
 * 3. Guardar (Ctrl+S)
 * 4. Implementar → Nueva implementación → Tipo: Aplicación web
 *      Ejecutar como: Yo
 *      Acceso: Cualquiera
 * 5. Copia la URL que termina en /exec
 * 6. Pégala en landing/partner-leads-config.js → webhookUrl
 * 7. Prueba en el navegador: TU-URL/exec?test=1
 */

var SPREADSHEET_ID = "1XdNVyeCK_55Sqm8fk3WYyg1hLuaBwINWnvBUrLENmpI";

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
    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/** Prueba rápida: abrir en el navegador …/exec?test=1 */
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.test === "1") {
      appendLead_({
        fecha: new Date().toISOString(),
        nombre: "Prueba webhook",
        email: "test@landadvisors.cl",
        telefono: "+56900000000",
        ciudad: "",
        comentario: "Fila de prueba desde Apps Script",
        partner: "Iterrasur",
        source: "Land Advisors Website (test)",
      });
      return jsonResponse_({ ok: true, message: "Fila de prueba agregada" });
    }
    return jsonResponse_({ ok: true, message: "Partner leads webhook activo" });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}
