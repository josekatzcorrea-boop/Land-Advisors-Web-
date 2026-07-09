#!/usr/bin/env node
/**
 * Diagnóstico del número WhatsApp Cloud API vs. lo que ve el usuario en la app.
 * Uso: node scripts/diagnose-phone.mjs
 */
import { config } from "../lib/config.mjs";

const version = config.graphVersion || "v22.0";
const base = `https://graph.facebook.com/${version}`;
const waba = process.env.META_WA_BUSINESS_ACCOUNT_ID || "1519931339630253";

async function api(path) {
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${config.waToken}` },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const fields = [
  "display_phone_number",
  "verified_name",
  "status",
  "platform_type",
  "is_on_biz_app",
  "code_verification_status",
  "name_status",
  "account_mode",
  "quality_rating",
  "messaging_limit_tier",
  "health_status",
].join(",");

console.log("=== Land Advisors — diagnóstico WhatsApp ===\n");

if (!config.waToken || !config.phoneNumberId) {
  console.error("Falta .env (META_WA_ACCESS_TOKEN, META_WA_PHONE_NUMBER_ID)");
  process.exit(1);
}

const phone = await api(`/${config.phoneNumberId}?fields=${fields}`);
if (phone.status !== 200) {
  console.error("Error API número:", phone.data);
  process.exit(1);
}

const p = phone.data;
console.log("Número API:", p.display_phone_number);
console.log("Nombre:", p.verified_name);
console.log("Estado Meta:", p.status);
console.log("Plataforma:", p.platform_type);
console.log("App en celular (coexistencia):", p.is_on_biz_app ? "sí" : "no — solo Cloud API");
console.log("Verificación SMS:", p.code_verification_status);
console.log("Modo cuenta:", p.account_mode);
console.log("Calidad:", p.quality_rating);
console.log("Límite mensajes:", p.messaging_limit_tier);
if (p.health_status) console.log("Salud:", JSON.stringify(p.health_status));

const nums = await api(
  `/${waba}/phone_numbers?fields=display_phone_number,status,platform_type,code_verification_status`
);
console.log("\nNúmeros en WABA:", nums.status === 200 ? nums.data.data?.length : "error");

console.log("\n--- Si WhatsApp dice «ya no tiene WhatsApp» ---");
console.log("Meta puede mostrar CONNECTED aunque el número no esté usable en la red.");
console.log("");
console.log("Causas frecuentes:");
console.log("  1. Chip +56999163518 sin línea activa (sin saldo / SIM apagada)");
console.log("  2. WhatsApp o WhatsApp Business instalado EN ESE CHIP (conflicto con API)");
console.log("  3. Falta paso POST /register (PIN de 6 dígitos)");
console.log("  4. Número recién agregado — esperar hasta 24 h");
console.log("");
console.log("Qué hacer (en orden):");
console.log("  A. NO instales WhatsApp en el chip del bot (+56999163518)");
console.log("  B. Verifica que el chip recibe SMS (línea activa)");
console.log("  C. Meta Business → WhatsApp → Números → revisar alertas");
console.log("  D. Re-registrar: node scripts/register-phone.mjs --pin 123456");
console.log("     (elige un PIN de 6 dígitos y guárdalo)");
console.log("");
console.log("Tu WhatsApp personal (+56974533265) es OTRO número.");
console.log("Problemas en el chip del bot NO borran el personal, salvo que");
console.log("instales WhatsApp en el chip equivocado o migres el +569 a Meta sin coexistencia.");
