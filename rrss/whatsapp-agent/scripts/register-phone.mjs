#!/usr/bin/env node
/**
 * Paso 4 de Meta: registrar número verificado para uso API.
 * Uso: node scripts/register-phone.mjs --pin 123456
 */
import { config } from "../lib/config.mjs";

const pinIdx = process.argv.indexOf("--pin");
const pin = pinIdx !== -1 ? process.argv[pinIdx + 1] : "";
if (!/^\d{6}$/.test(pin)) {
  console.error("Uso: node scripts/register-phone.mjs --pin 123456");
  console.error("PIN de 6 dígitos (nuevo o el de verificación en dos pasos del número).");
  process.exit(1);
}

const version = config.graphVersion || "v22.0";
const url = `https://graph.facebook.com/${version}/${config.phoneNumberId}/register`;

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${config.waToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messaging_product: "whatsapp",
    pin,
  }),
});

const data = await res.json().catch(() => ({}));
console.log("HTTP", res.status);
console.log(JSON.stringify(data, null, 2));

if (res.ok && data.success) {
  console.log("\nRegistro OK. Espera 5–30 min y prueba wa.me desde otro celular.");
} else if (data.error?.code === 133005) {
  console.log("\nPIN incorrecto. Usa el PIN de verificación en dos pasos del número en Meta.");
} else if (data.error?.code === 133016) {
  console.log("\nDemasiados intentos. Espera 72 h antes de reintentar.");
}
