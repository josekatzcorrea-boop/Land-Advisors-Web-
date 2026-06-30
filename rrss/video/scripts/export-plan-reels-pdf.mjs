/**
 * Genera PDF del plan de Reels desde HTML.
 * Uso: node rrss/video/scripts/export-plan-reels-pdf.mjs
 */
import { spawn } from "child_process";
import { existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..", "..");
const htmlPath = join(root, "rrss", "video", "export", "PLAN-REELS-2026-07-08.html");
const pdfPath = join(root, "rrss", "video", "export", "PLAN-REELS-2026-07-08.pdf");
const htmlUrl = "file:///" + htmlPath.replace(/\\/g, "/");

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const exe = chromeCandidates.find((p) => existsSync(p));
if (!exe) {
  console.error("No se encontró Chrome ni Edge para imprimir PDF.");
  process.exit(1);
}

const args = [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${pdfPath}`,
  htmlUrl,
];

const child = spawn(exe, args, { stdio: "inherit" });
child.on("close", (code) => {
  if (code === 0) console.log("PDF generado:", pdfPath);
  else process.exit(code || 1);
});
