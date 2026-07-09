#!/usr/bin/env node
/**
 * Actualiza el teléfono de campaña en archivos clave del repo.
 * Uso: node scripts/switch-campaign-phone.mjs --phone 56912345678
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");

function argPhone() {
  const i = process.argv.indexOf("--phone");
  if (i === -1 || !process.argv[i + 1]) {
    console.error("Uso: node scripts/switch-campaign-phone.mjs --phone 56912345678");
    process.exit(1);
  }
  return process.argv[i + 1].replace(/\D/g, "");
}

const phone = argPhone();
const e164 = phone.startsWith("56") ? `+${phone}` : `+56${phone.replace(/^0/, "")}`;
const waMe = phone.startsWith("56") ? phone : `56${phone}`;

const files = [
  {
    path: path.join(root, "landing/campaign-landing.js"),
    edit: (s) => s.replace(/const phone = "\d+";/, `const phone = "${waMe.replace(/^56/, "56")}";`),
  },
  {
    path: path.join(root, "rrss/whatsapp-agent/flow.json"),
    edit: (s) => {
      const j = JSON.parse(s);
      j.phone = e164;
      return JSON.stringify(j, null, 2) + "\n";
    },
  },
];

for (const f of files) {
  if (!fs.existsSync(f.path)) {
    console.warn("SKIP (no existe):", f.path);
    continue;
  }
  const before = fs.readFileSync(f.path, "utf8");
  fs.writeFileSync(f.path, f.edit(before), "utf8");
  console.log("OK", path.relative(root, f.path));
}

console.log("\nTeléfono campaña:", e164);
console.log("Actualiza también META_WA_PHONE_NUMBER_ID en Render .env con el ID del número nuevo en Meta.");
