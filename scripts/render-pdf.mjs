import fs from 'fs';
import https from 'https';
import zlib from 'zlib';
import path from 'path';
import vm from 'vm';

const pdfPath = process.argv[2];
const outPng = process.argv[3];
const scale = Number(process.argv[4] || 4);

const PDFJS_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          download(res.headers.location).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

class NodeCanvasFactory {
  create(width, height) {
    const canvas = { width, height };
    const context = {
      canvas,
      _buf: new Uint8ClampedArray(width * height * 4),
      fillStyle: '#ffffff',
      fillRect(x, y, w, h) {
        for (let row = y; row < y + h; row++) {
          for (let col = x; col < x + w; col++) {
            const i = (row * width + col) * 4;
            this._buf[i] = 255;
            this._buf[i + 1] = 255;
            this._buf[i + 2] = 255;
            this._buf[i + 3] = 255;
          }
        }
      },
      drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
        const src = img.data || img;
        for (let y = 0; y < dh; y++) {
          for (let x = 0; x < dw; x++) {
            const sxPos = Math.min(sw - 1, Math.floor((x / dw) * sw));
            const syPos = Math.min(sh - 1, Math.floor((y / dh) * sh));
            const si = (syPos * sw + sxPos) * 4;
            const di = ((dy + y) * width + (dx + x)) * 4;
            this._buf[di] = src[si];
            this._buf[di + 1] = src[si + 1];
            this._buf[di + 2] = src[si + 2];
            this._buf[di + 3] = src[si + 3];
          }
        }
      },
      getImageData(sx, sy, sw, sh) {
        const data = new Uint8ClampedArray(sw * sh * 4);
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const si = ((sy + y) * width + (sx + x)) * 4;
            const di = (y * sw + x) * 4;
            data[di] = this._buf[si];
            data[di + 1] = this._buf[si + 1];
            data[di + 2] = this._buf[si + 2];
            data[di + 3] = this._buf[si + 3];
          }
        }
        return { width: sw, height: sh, data };
      },
      putImageData(img, dx, dy) {
        const sw = img.width;
        const sh = img.height;
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const si = (y * sw + x) * 4;
            const di = ((dy + y) * width + (dx + x)) * 4;
            this._buf[di] = img.data[si];
            this._buf[di + 1] = img.data[si + 1];
            this._buf[di + 2] = img.data[si + 2];
            this._buf[di + 3] = img.data[si + 3];
          }
        }
      },
      save() {},
      restore() {},
      transform() {},
      beginPath() {},
      closePath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      fill() {},
      clip() {},
      rect() {},
      clearRect(x, y, w, h) {
        this.fillRect(x, y, w, h);
      },
      createImageData(w, h) {
        return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
      },
      measureText() {
        return { width: 0 };
      },
      set fillStyle(v) {
        this._fillStyle = v;
      },
      get fillStyle() {
        return this._fillStyle || '#000';
      },
      set font(v) {
        this._font = v;
      },
      get font() {
        return this._font || '10px sans-serif';
      },
      set globalAlpha(v) {
        this._globalAlpha = v;
      },
      get globalAlpha() {
        return this._globalAlpha ?? 1;
      },
      set lineWidth(v) {
        this._lineWidth = v;
      },
      get lineWidth() {
        return this._lineWidth ?? 1;
      },
      set strokeStyle(v) {
        this._strokeStyle = v;
      },
      get strokeStyle() {
        return this._strokeStyle || '#000';
      },
      set textBaseline(v) {
        this._textBaseline = v;
      },
      get textBaseline() {
        return this._textBaseline || 'alphabetic';
      },
      set textAlign(v) {
        this._textAlign = v;
      },
      get textAlign() {
        return this._textAlign || 'start';
      },
      fillText() {},
      strokeText() {},
    };
    context.fillRect(0, 0, width, height);
    return { canvas, context };
  }
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, t, data, crc]);
}

function rgbaToPng(width, height, rgba) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = rowStart + 1 + x * 4;
      raw[di] = rgba[si];
      raw[di + 1] = rgba[si + 1];
      raw[di + 2] = rgba[si + 2];
      raw[di + 3] = rgba[si + 3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const cacheDir = path.join(scriptDir, '.cache');
fs.mkdirSync(cacheDir, { recursive: true });
const pdfjsPath = path.join(cacheDir, 'pdf-2.min.js');
if (!fs.existsSync(pdfjsPath)) {
  fs.writeFileSync(pdfjsPath, await download(PDFJS_URL));
}

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  URL,
  Uint8Array,
  Uint8ClampedArray,
  ArrayBuffer,
  DataView,
  TextEncoder,
  TextDecoder,
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  performance: { now: () => Date.now() },
  navigator: { userAgent: 'node' },
  window: null,
  self: null,
  document: { createElement: () => ({ style: {} }) },
  process: { versions: { node: '22.0.0' } },
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(pdfjsPath, 'utf8'), sandbox);
const pdfjsLib = sandbox.pdfjsLib;

const data = new Uint8Array(fs.readFileSync(pdfPath));
const pdf = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
const page = await pdf.getPage(1);
const viewport = page.getViewport({ scale });
const factory = new NodeCanvasFactory();
const { canvas, context } = factory.create(viewport.width, viewport.height);
await page.render({
  canvasContext: context,
  viewport,
  canvasFactory: factory,
}).promise;

const png = rgbaToPng(canvas.width, canvas.height, context._buf);
fs.mkdirSync(path.dirname(outPng), { recursive: true });
fs.writeFileSync(outPng, png);
console.log(`Saved ${outPng} (${canvas.width}x${canvas.height})`);
