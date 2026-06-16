#!/usr/bin/env node
/**
 * Recoloriza isotipo a #0F4C5C sin alterar forma, alpha ni fondo.
 */
import fs from "fs";
import path from "path";
import { PNG } from "pngjs";

const TARGET = { r: 15, g: 76, b: 92 }; // #0F4C5C
const SOURCE = { r: 5, g: 44, b: 77 }; // #052C4D — azul actual del asset
const SOURCE_REF = Math.max(SOURCE.r, SOURCE.g, SOURCE.b);

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h, s, v];
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    default: r = v; g = p; b = q;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const [, , mode, filePath] = process.argv;
if (!filePath) {
  console.error("Uso: node recolor-isotipo.mjs [flat|3d] <archivo.png>");
  process.exit(1);
}

const buf = fs.readFileSync(filePath);
const png = PNG.sync.read(buf);
const [targetH] = rgbToHsv(TARGET.r, TARGET.g, TARGET.b);

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (png.width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const a = png.data[idx + 3];
    if (a === 0) continue;

    if (mode === "3d") {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const isWhite = r > 235 && g > 235 && b > 235;
      const isShadow = sat < 0.12 && max < 210;
      const isBlueLogo = b >= r && b >= g && sat > 0.2;
      if (isWhite || isShadow || !isBlueLogo) continue;
      const [, s, v] = rgbToHsv(r, g, b);
      const [nr, ng, nb] = hsvToRgb(targetH, s, v);
      png.data[idx] = nr;
      png.data[idx + 1] = ng;
      png.data[idx + 2] = nb;
    } else {
      const max = Math.max(r, g, b);
      const factor = max / SOURCE_REF;
      png.data[idx] = Math.min(255, Math.round(TARGET.r * factor));
      png.data[idx + 1] = Math.min(255, Math.round(TARGET.g * factor));
      png.data[idx + 2] = Math.min(255, Math.round(TARGET.b * factor));
    }
  }
}

fs.writeFileSync(filePath, PNG.sync.write(png));
console.log("OK", filePath);
