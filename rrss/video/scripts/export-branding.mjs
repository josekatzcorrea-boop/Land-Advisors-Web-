/**
 * Exporta frames de branding Reel (1080×1920) vía Chrome/Edge headless.
 * Uso: node export-branding.mjs intro|outro
 */
import { spawn } from "child_process";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frame = process.argv[2] || "intro";
const port = Number(process.env.SERVE_PORT || 8765);
const outDir = join(__dirname, "..", "assets", "branding", "png");
const url = `http://127.0.0.1:${port}/rrss/video/assets/branding/${frame}.html`;

const W = 1080;
const H = 1920;
const CDP_PORT = Number(process.env.CDP_PORT || 9225);

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const executablePath = chromeCandidates.find((p) => existsSync(p));
if (!executablePath) {
  console.error("No se encontró Chrome ni Edge.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

mkdirSync(outDir, { recursive: true });

const chrome = spawn(
  executablePath,
  [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    "--no-first-run",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true }
);

const exit = () => {
  try {
    chrome.kill("SIGTERM");
  } catch {
    /* ignore */
  }
};
process.on("exit", exit);

try {
  await sleep(2000);
  const targets = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`).then((r) =>
    r.json()
  );
  const pageTarget = targets.find((t) => t.type === "page");
  if (!pageTarget?.webSocketDebuggerUrl) throw new Error("CDP target no disponible");

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: W,
    height: H,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.send("Page.navigate", { url });
  await sleep(2000);
  await cdp.send("Runtime.evaluate", {
    expression: "document.fonts && document.fonts.ready",
    awaitPromise: true,
  });
  await sleep(600);

  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true,
  });

  const filepath = join(outDir, `${frame}.png`);
  writeFileSync(filepath, Buffer.from(shot.data, "base64"));
  console.log(`OK ${filepath}`);
  ws.close();
  exit();
} catch (err) {
  exit();
  console.error(err.message || err);
  process.exit(1);
}
