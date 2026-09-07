#!/usr/bin/env node
/**
 * Genera WebP para imágenes críticas del home (LCP + casos).
 * Uso: npm install --prefix landing && node landing/scripts/optimize-webp.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES = path.join(__dirname, "..", "images");

const TARGETS = [
  { file: "hero.jpg", maxWidth: 1920, quality: 82 },
  { file: "caso-puerto-varas.jpg", maxWidth: 1200, quality: 80 },
  { file: "caso-frutillar.jpg", maxWidth: 1200, quality: 80 },
  { file: "caso-llanquihue.jpg", maxWidth: 1200, quality: 80 },
  { file: "como-pensamos.jpg", maxWidth: 900, quality: 80 },
];

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("skip optimize-webp: sharp not installed (npm install --prefix landing)");
  process.exit(0);
}

for (const { file, maxWidth, quality } of TARGETS) {
  const src = path.join(IMAGES, file);
  if (!fs.existsSync(src)) {
    console.warn("missing:", file);
    continue;
  }
  const dest = path.join(IMAGES, file.replace(/\.(jpe?g|png)$/i, ".webp"));
  const meta = await sharp(src).metadata();
  const w = meta.width && meta.width > maxWidth ? maxWidth : meta.width;
  await sharp(src)
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality })
    .toFile(dest);
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`OK ${path.basename(dest)} -> ${kb} KB`);
}
