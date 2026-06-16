/**
 * PDF móvil para catálogo (o cualquier deck .catalog-pages / .brochure-pages).
 */
import { spawn } from "child_process";
import { writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPdf =
  process.env.OUT_PDF || join(__dirname, "Land-Advisors-Catalogo-movil.pdf");
const baseUrl =
  process.env.PAGE_URL ||
  "http://127.0.0.1:8765/catalogo/index.html";
const url = baseUrl.includes("?")
  ? `${baseUrl}&export=movil`
  : `${baseUrl}?export=movil`;
const VIEWPORT_W = 430;
const DEVICE_SCALE = Number(process.env.PDF_SCALE || 1.5);
const CDP_PORT = Number(process.env.CDP_PORT || 9224);

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
  for (let i = 0; i < 60; i++) {
    const { result } = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (result.value === "complete") return;
    await sleep(500);
  }
}

const chrome = spawn(
  executablePath,
  [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
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
    width: VIEWPORT_W,
    height: 800,
    deviceScaleFactor: DEVICE_SCALE,
    mobile: true,
    screenWidth: VIEWPORT_W,
    screenHeight: 800,
  });
  await cdp.send("Emulation.setEmulatedMedia", { media: "screen" });
  await cdp.send("Page.navigate", { url });
  await waitForLoad(cdp);
  await sleep(1500);

  await cdp.send("Runtime.evaluate", {
    expression: "document.fonts && document.fonts.ready",
    awaitPromise: true,
  });
  await cdp.send("Runtime.evaluate", {
    expression: `
      document.documentElement.setAttribute('data-export','movil');
      document.querySelector('.catalog-toolbar, .brochure-toolbar')?.remove();
    `,
  });
  await sleep(600);

  const { result: heightResult } = await cdp.send("Runtime.evaluate", {
    expression: `(function(){
      const deck = document.querySelector('.catalog-pages, .brochure-pages');
      return Math.ceil(deck.getBoundingClientRect().height);
    })()`,
    returnByValue: true,
  });

  const heightPx = Math.ceil(heightResult.value || 3000);
  const paperWidth = VIEWPORT_W / 96;
  const paperHeight = heightPx / 96;

  const pdf = await cdp.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: false,
    paperWidth,
    paperHeight,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    scale: 1,
  });

  writeFileSync(outPdf, Buffer.from(pdf.data, "base64"));
  ws.close();
  exit();

  console.log(`PDF móvil listo: ${outPdf}`);
  console.log(
    `Vista: ${VIEWPORT_W}px × ${heightPx}px · escala ${DEVICE_SCALE}x · media screen`
  );
} catch (err) {
  exit();
  console.error(err.message || err);
  process.exit(1);
}
