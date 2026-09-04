#!/usr/bin/env node
/**
 * Optimiza fotos DJI (+ 1 lifestyle Patagonia) → images/plh/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "Imágenes");
const OUT_DIR = path.join(ROOT, "images", "plh");

/** @type {{ src: string, out: string, w?: number, h?: number, pos?: string }[]} */
const MAP = [
  { src: "DJI_1531.JPG", out: "plh-hero.jpg", w: 2560 },
  { src: "galeria 0.png", out: "plh-lagos.jpg", w: 2560 },
  { src: "DJI_1540.JPG", out: "plh-patagonia.jpg", w: 2560, pos: "centre" },
  { src: "Llanquihue.jpg", out: "plh-patagonia-life.jpg", w: 2560 },
  { src: "DJI_1498.JPG", out: "plh-band-1.jpg", w: 2560 },
  { src: "DJI_1436.JPG", out: "plh-band-2.jpg", w: 2560 },
  { src: "DJI_1430.JPG", out: "plh-band-3.jpg", w: 2560 },
  { src: "DJI_1531.JPG", out: "plh-cta.jpg", w: 2200 },
];

function findSrc(name) {
  if (!fs.existsSync(SRC_DIR)) return null;
  const exact = path.join(SRC_DIR, name);
  if (fs.existsSync(exact)) return exact;
  const hit = fs.readdirSync(SRC_DIR).find((f) => f.toLowerCase() === name.toLowerCase());
  return hit ? path.join(SRC_DIR, hit) : null;
}

function ensureSharp() {
  const modDir = path.join(__dirname, "node_modules", "sharp");
  if (fs.existsSync(modDir)) return true;
  try {
    execSync("npm install sharp --no-save --silent", { cwd: __dirname, stdio: "inherit" });
    return fs.existsSync(modDir);
  } catch {
    return false;
  }
}

async function optimizeWithSharp(src, dest, item) {
  const sharp = (await import("sharp")).default;
  let pipe = sharp(src).rotate();
  if (item.w && item.h) {
    pipe = pipe.resize(item.w, item.h, { fit: "cover", position: "centre" });
  } else if (item.w) {
    pipe = pipe.resize({ width: item.w, withoutEnlargement: true });
  }
  await pipe.jpeg({ quality: 84, mozjpeg: true }).toFile(dest);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const hasSharp = ensureSharp();
  for (const item of MAP) {
    const src = findSrc(item.src);
    if (!src) {
      console.warn("skip:", item.src);
      continue;
    }
    const dest = path.join(OUT_DIR, item.out);
    if (hasSharp) {
      await optimizeWithSharp(src, dest, item);
      console.log("optimized:", item.out);
    } else {
      fs.copyFileSync(src, dest);
      console.log("copied:", item.out);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
