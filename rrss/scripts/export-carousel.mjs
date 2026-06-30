/**
 * Exporta slides de carrusel RRSS a PNG 1080×1350 vía Chrome/Edge headless + CDP.
 */
import { spawn } from "child_process";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postId = process.env.POST_ID || "2026-06-09-R1";
const rrssDir = join(__dirname, "..");
const postDir = join(rrssDir, "posts", postId);
const outDir =
  process.env.OUT_DIR || join(rrssDir, "output", postId);
const port = Number(process.env.SERVE_PORT || 8765);
const baseUrl =
  process.env.CAROUSEL_URL ||
  `http://127.0.0.1:${port}/rrss/posts/${postId}/index.html`;
const url = baseUrl.includes("?") ? `${baseUrl}&export=1` : `${baseUrl}?export=1`;

const SLIDE_W = 1080;
const SLIDE_H = 1350;
const DEVICE_SCALE = Number(process.env.DEVICE_SCALE || 1);
const CDP_PORT = Number(process.env.CDP_PORT || 9224);
const SLIDE_COUNT = Number(process.env.SLIDE_COUNT || 7);

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

async function waitForLoad(cdp) {
  for (let i = 0; i < 80; i++) {
    const { result } = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (result.value === "complete") return;
    await sleep(400);
  }
}

mkdirSync(outDir, { recursive: true });

const chrome = spawn(
  executablePath,
  [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true }
);

let exit = () => {
  try {
    chrome.kill("SIGTERM");
  } catch {
    /* ignore */
  }
};

process.on("exit", exit);
process.on("SIGINT", () => {
  exit();
  process.exit(130);
});

try {
  await sleep(2000);

  const targets = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`).then((r) =>
    r.json()
  );
  const pageTarget = targets.find((t) => t.type === "page");
  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error("No se obtuvo target de Chrome DevTools.");
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: SLIDE_W,
    height: SLIDE_H,
    deviceScaleFactor: DEVICE_SCALE,
    mobile: false,
    screenWidth: SLIDE_W,
    screenHeight: SLIDE_H,
  });
  await cdp.send("Emulation.setEmulatedMedia", { media: "screen" });
  await cdp.send("Page.navigate", { url });
  await waitForLoad(cdp);
  await sleep(1200);

  await cdp.send("Runtime.evaluate", {
    expression: "document.fonts && document.fonts.ready",
    awaitPromise: true,
  });

  await cdp.send("Runtime.evaluate", {
    expression: `
      document.body.classList.add('export-mode');
      document.querySelector('.carousel-toolbar')?.remove();
    `,
  });
  await sleep(800);

  for (let n = 1; n <= SLIDE_COUNT; n++) {
    await cdp.send("Runtime.evaluate", {
      expression: `
        document.querySelectorAll('[data-slide]').forEach((el) => {
          el.style.display = el.dataset.slide === '${n}' ? 'flex' : 'none';
        });
      `,
    });
    await sleep(400);

    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
      fromSurface: true,
    });

    const filename = `slide-${String(n).padStart(2, "0")}.png`;
    const filepath = join(outDir, filename);
    writeFileSync(filepath, Buffer.from(shot.data, "base64"));
    console.log(`OK ${filename} (${SLIDE_W}×${SLIDE_H})`);
  }

  ws.close();
  exit();
  console.log(`\nCarrusel exportado: ${outDir}`);
} catch (err) {
  exit();
  console.error(err.message || err);
  process.exit(1);
}
