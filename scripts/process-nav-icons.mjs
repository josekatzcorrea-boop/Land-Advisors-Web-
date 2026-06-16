#!/usr/bin/env node
/**
 * Recolor nav icons to #052C4D and normalize stroke width.
 * Pure Node (zlib/fs) — no npm dependencies.
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BRAND = { r: 5, g: 44, b: 77 }; // #052C4D
const TARGET_RADIUS = 5; // half-width in px → ~10px stroke at 500×500
const FILL_MIN_AREA = 2800; // large silhouettes (e.g. VISIÓN head)
const SOLID_MIN_AREA = 120; // small filled shapes (heart, photo block, cuff)

const ICONS = ["NOTICIAS", "SERVICIOS", "CLIENTES", "VISIÓN"];

// ── Minimal PNG decode / encode ────────────────────────────────────────────

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePNG(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("Not PNG");
  let offset = 8;
  let width, height, bitDepth, colorType;
  const idats = [];

  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + len);
    offset += 12 + len;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (bitDepth !== 8 || colorType !== 6)
        throw new Error(`Unsupported PNG: depth=${bitDepth} color=${colorType}`);
    } else if (type === "IDAT") {
      idats.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  const raw = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 4;
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);
  let rawOff = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[rawOff++];
    for (let x = 0; x < stride; x++) {
      const i = rawOff + x;
      let val = raw[i];
      const left = x >= bpp ? pixels[y * stride + x - bpp] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= bpp ? pixels[(y - 1) * stride + x - bpp] : 0;

      switch (filter) {
        case 1: val = (val + left) & 255; break;
        case 2: val = (val + up) & 255; break;
        case 3: val = (val + ((left + up) >> 1)) & 255; break;
        case 4: val = (val + paeth(left, up, upLeft)) & 255; break;
      }
      pixels[y * stride + x] = val;
    }
    rawOff += stride;
  }

  return { width, height, data: pixels };
}

function encodePNG({ width, height, data }) {
  const bpp = 4;
  const stride = width * bpp;
  const rawRows = Buffer.alloc(height * (1 + stride));
  let wOff = 0;

  for (let y = 0; y < height; y++) {
    rawRows[wOff++] = 0; // filter none
    for (let x = 0; x < stride; x++) {
      rawRows[wOff++] = data[y * stride + x];
    }
  }

  const compressed = zlib.deflateSync(rawRows, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, payload) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(payload.length);
    const typeBuf = Buffer.from(type);
    const crcBuf = Buffer.concat([typeBuf, payload]);
    const crc = crc32(crcBuf);
    const crcOut = Buffer.alloc(4);
    crcOut.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, typeBuf, payload, crcOut]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── Morphology helpers ─────────────────────────────────────────────────────

function isInk(r, g, b, a) {
  if (a < 40) return false;
  return !(r > 240 && g > 240 && b > 240);
}

function idx(w, x, y) {
  return y * w + x;
}

function dilate(mask, w, h, r) {
  const out = new Uint8Array(w * h);
  const r2 = r * r;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[idx(w, x, y)]) continue;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) out[idx(w, nx, ny)] = 1;
        }
      }
    }
  }
  return out;
}

function erode(mask, w, h, r) {
  const out = new Uint8Array(w * h);
  const r2 = r * r;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[idx(w, x, y)]) continue;
      let ok = true;
      for (let dy = -r; dy <= r && ok; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h || !mask[idx(w, nx, ny)]) {
            ok = false;
            break;
          }
        }
      }
      if (ok) out[idx(w, x, y)] = 1;
    }
  }
  return out;
}

function neighbors(mask, w, h, x, y) {
  let n = 0;
  const pts = [
    [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
    [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1],
  ];
  for (const [nx, ny] of pts) {
    if (nx >= 0 && nx < w && ny >= 0 && ny < h && mask[idx(w, nx, ny)]) n++;
  }
  return n;
}

function zhangSuenThin(mask, w, h) {
  const img = Uint8Array.from(mask);
  let changed = true;
  while (changed) {
    changed = false;
    const mark = [];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = idx(w, x, y);
        if (!img[i]) continue;
        const p2 = img[idx(w, x, y - 1)];
        const p3 = img[idx(w, x + 1, y - 1)];
        const p4 = img[idx(w, x + 1, y)];
        const p5 = img[idx(w, x + 1, y + 1)];
        const p6 = img[idx(w, x, y + 1)];
        const p7 = img[idx(w, x - 1, y + 1)];
        const p8 = img[idx(w, x - 1, y)];
        const p9 = img[idx(w, x - 1, y - 1)];
        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;
        const seq =
          (p2 === 0 && p3 === 1) + (p3 === 0 && p4 === 1) +
          (p4 === 0 && p5 === 1) + (p5 === 0 && p6 === 1) +
          (p6 === 0 && p7 === 1) + (p7 === 0 && p8 === 1) +
          (p8 === 0 && p9 === 1) + (p9 === 0 && p2 === 1);
        if (seq !== 1) continue;
        if (p2 * p4 * p6 !== 0) continue;
        if (p4 * p6 * p8 !== 0) continue;
        mark.push(i);
      }
    }
    if (mark.length) {
      changed = true;
      for (const i of mark) img[i] = 0;
    }
    const mark2 = [];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = idx(w, x, y);
        if (!img[i]) continue;
        const p2 = img[idx(w, x, y - 1)];
        const p3 = img[idx(w, x + 1, y - 1)];
        const p4 = img[idx(w, x + 1, y)];
        const p5 = img[idx(w, x + 1, y + 1)];
        const p6 = img[idx(w, x, y + 1)];
        const p7 = img[idx(w, x - 1, y + 1)];
        const p8 = img[idx(w, x - 1, y)];
        const p9 = img[idx(w, x - 1, y - 1)];
        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;
        const seq =
          (p2 === 0 && p3 === 1) + (p3 === 0 && p4 === 1) +
          (p4 === 0 && p5 === 1) + (p5 === 0 && p6 === 1) +
          (p6 === 0 && p7 === 1) + (p7 === 0 && p8 === 1) +
          (p8 === 0 && p9 === 1) + (p9 === 0 && p2 === 1);
        if (seq !== 1) continue;
        if (p2 * p4 * p8 !== 0) continue;
        if (p2 * p6 * p8 !== 0) continue;
        mark2.push(i);
      }
    }
    if (mark2.length) {
      changed = true;
      for (const i of mark2) img[i] = 0;
    }
  }
  return img;
}

function componentHasHole(comp, w, h) {
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (comp[idx(w, x, y)]) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < minX) return false;

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const local = new Uint8Array(bw * bh);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      local[(y - minY) * bw + (x - minX)] = comp[idx(w, x, y)] ? 1 : 0;
    }
  }

  const bg = new Uint8Array(bw * bh);
  const stack = [];
  for (let x = 0; x < bw; x++) {
    if (!local[x]) stack.push([x, 0]);
    if (!local[(bh - 1) * bw + x]) stack.push([x, bh - 1]);
  }
  for (let y = 0; y < bh; y++) {
    if (!local[y * bw]) stack.push([0, y]);
    if (!local[y * bw + bw - 1]) stack.push([bw - 1, y]);
  }

  while (stack.length) {
    const [x, y] = stack.pop();
    const i = y * bw + x;
    if (bg[i] || local[i]) continue;
    bg[i] = 1;
    if (x > 0) stack.push([x - 1, y]);
    if (x < bw - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < bh - 1) stack.push([x, y + 1]);
  }

  for (let i = 0; i < bw * bh; i++) {
    if (!local[i] && !bg[i]) return true;
  }
  return false;
}

function labelComponents(mask, w, h) {
  const labels = new Int32Array(w * h);
  let next = 1;
  const areas = [0];
  const maxDt = [0];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(w, x, y);
      if (!mask[i] || labels[i]) continue;
      const label = next++;
      const stack = [[x, y]];
      labels[i] = label;
      let area = 0;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        area++;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const ni = idx(w, nx, ny);
          if (mask[ni] && !labels[ni]) {
            labels[ni] = label;
            stack.push([nx, ny]);
          }
        }
      }
      areas[label] = area;
      maxDt[label] = 0;
    }
  }
  return { labels, areas, maxDt, count: next - 1 };
}

function chamferDT(mask, w, h) {
  const INF = 1e9;
  const dt = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) dt[i] = mask[i] ? INF : 0;

  // forward
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(w, x, y);
      if (!mask[i]) continue;
      let m = dt[i];
      if (x > 0) m = Math.min(m, dt[i - 1] + 1);
      if (y > 0) m = Math.min(m, dt[i - w] + 1);
      if (x > 0 && y > 0) m = Math.min(m, dt[i - w - 1] + 1.414);
      if (x < w - 1 && y > 0) m = Math.min(m, dt[i - w + 1] + 1.414);
      dt[i] = m;
    }
  }
  // backward
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = idx(w, x, y);
      if (!mask[i]) continue;
      let m = dt[i];
      if (x < w - 1) m = Math.min(m, dt[i + 1] + 1);
      if (y < h - 1) m = Math.min(m, dt[i + w] + 1);
      if (x < w - 1 && y < h - 1) m = Math.min(m, dt[i + w + 1] + 1.414);
      if (x > 0 && y < h - 1) m = Math.min(m, dt[i + w - 1] + 1.414);
      dt[i] = m;
    }
  }
  return dt;
}

function processIcon(filePath) {
  const buf = fs.readFileSync(filePath);
  const { width: w, height: h, data } = decodePNG(buf);
  const stride = w * 4;
  const mask = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = y * stride + x * 4;
      mask[idx(w, x, y)] = isInk(data[pi], data[pi + 1], data[pi + 2], data[pi + 3]) ? 1 : 0;
    }
  }

  const dt = chamferDT(mask, w, h);
  const { labels, areas, count } = labelComponents(mask, w, h);
  const compMaxDt = new Float32Array(count + 1);
  for (let i = 0; i < w * h; i++) {
    if (!mask[i]) continue;
    const lb = labels[i];
    compMaxDt[lb] = Math.max(compMaxDt[lb], dt[i]);
  }

  const outMask = new Uint8Array(w * h);

  for (let label = 1; label <= count; label++) {
    const comp = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      if (labels[i] === label) comp[i] = 1;
    }
    const area = areas[label];
    const maxD = compMaxDt[label];
    const hasHole = componentHasHole(comp, w, h);
    const isLargeFill = area >= FILL_MIN_AREA && maxD >= TARGET_RADIUS + 2;
    const isSolidFill = !hasHole && area >= SOLID_MIN_AREA;
    const isFill = isLargeFill || isSolidFill;

    let processed;
    if (isFill) {
      processed = comp;
    } else {
      const skel = zhangSuenThin(comp, w, h);
      processed = dilate(skel, w, h, TARGET_RADIUS);
    }

    for (let i = 0; i < w * h; i++) {
      if (processed[i]) outMask[i] = 1;
    }
  }

  // Smooth junctions slightly
  const smoothed = dilate(erode(outMask, w, h, 1), w, h, 1);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = y * stride + x * 4;
      if (smoothed[idx(w, x, y)]) {
        data[pi] = BRAND.r;
        data[pi + 1] = BRAND.g;
        data[pi + 2] = BRAND.b;
        data[pi + 3] = 255;
      } else {
        data[pi] = 255;
        data[pi + 1] = 255;
        data[pi + 2] = 255;
        data[pi + 3] = 255;
      }
    }
  }

  fs.writeFileSync(filePath, encodePNG({ width: w, height: h, data }));
  return { w, h, area: smoothed.reduce((a, v) => a + v, 0) };
}

// ── Analysis ─────────────────────────────────────────────────────────────────

function analyze(filePath) {
  const buf = fs.readFileSync(filePath);
  const { width: w, height: h, data } = decodePNG(buf);
  const stride = w * 4;
  const mask = new Uint8Array(w * h);
  const colors = new Map();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = y * stride + x * 4;
      const r = data[pi], g = data[pi + 1], b = data[pi + 2], a = data[pi + 3];
      if (!isInk(r, g, b, a)) continue;
      mask[idx(w, x, y)] = 1;
      const key = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      colors.set(key, (colors.get(key) || 0) + 1);
    }
  }

  const dt = chamferDT(mask, w, h);
  let minD = Infinity, maxD = 0, sum = 0, n = 0;
  for (let i = 0; i < w * h; i++) {
    if (!mask[i]) continue;
    const d = dt[i];
    if (d < minD) minD = d;
    if (d > maxD) maxD = d;
    sum += d;
    n++;
  }

  return {
    file: path.basename(filePath),
    size: `${w}x${h}`,
    inkPixels: n,
    colors: [...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
    dtMin: minD.toFixed(1),
    dtMax: maxD.toFixed(1),
    dtMean: (sum / n).toFixed(1),
  };
}

console.log("=== BEFORE ===");
for (const name of ICONS) {
  const p = path.join(ROOT, "assets", `${name}.png`);
  console.log(JSON.stringify(analyze(p)));
}

console.log("\n=== PROCESSING (target radius:", TARGET_RADIUS, "px) ===");
for (const name of ICONS) {
  const p = path.join(ROOT, "assets", `${name}.png`);
  const r = processIcon(p);
  console.log(`OK ${name}.png — ink pixels: ${r.area}`);
}

console.log("\n=== AFTER ===");
for (const name of ICONS) {
  const p = path.join(ROOT, "assets", `${name}.png`);
  console.log(JSON.stringify(analyze(p)));
}
