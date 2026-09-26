#!/usr/bin/env node
/**
 * Genera la versión inglesa estática (/en/...) a partir del HTML español ya construido.
 * El texto EN sale de i18n/en/*.json aplicado con la misma lógica de i18n.js (applyDict).
 * Rutas ES → EN: seo/i18n-routes.json
 * Uso: node scripts/build-en-pages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SEO = path.join(ROOT, "seo");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const site = readJson(path.join(SEO, "site.json"));
const SITE_URL = site.url.replace(/\/$/, "");
const routes = readJson(path.join(SEO, "i18n-routes.json")).routes;
const I18N_SRC = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");

const DICTS = {
  common: readJson(path.join(ROOT, "i18n/en/common.json")),
  home: readJson(path.join(ROOT, "i18n/en/home.json")),
  plh: readJson(path.join(ROOT, "i18n/en/plh.json")),
  seo: readJson(path.join(ROOT, "i18n/en/seo-pages.json")),
};

/** Páginas ES que solo redirigen (noindex): enlazar a la EN de su destino. */
const redirectAliases = {};
for (const g of readJson(path.join(SEO, "guides.json")).guides || []) {
  redirectAliases[`/guias/${g.slug}/`] = "/guias/";
}
for (const r of readJson(path.join(SEO, "posts.json")).retired || []) {
  redirectAliases[`/blog/${r.slug}/`] = "/" + String(r.redirectTo || "").replace(/^\//, "");
}

function enPathFor(esPath) {
  let p = esPath.replace(/\/index\.html$/, "/");
  p = redirectAliases[p] || p;
  return routes[p] || null;
}

function relativeUrl(fromDir, target) {
  let rel = path.posix.relative(fromDir, target);
  if (target.endsWith("/") && rel && !rel.endsWith("/")) rel += "/";
  return rel || "./";
}

function isSiteUrl(u) {
  return /^https?:\/\/(www\.)?landadvisors\.cl(\/|$)/i.test(u);
}

function rewriteUrl(val, esPath, enPath, isNav) {
  const v = val.trim();
  if (!v || /^(#|\?|mailto:|tel:|data:|javascript:|blob:|\{)/i.test(v)) return val;
  if (/^(https?:)?\/\//i.test(v)) {
    if (!isNav || !isSiteUrl(v)) return val;
    const u = new URL(v, SITE_URL);
    const en = enPathFor(u.pathname);
    return en ? SITE_URL + en + u.search + u.hash : val;
  }
  const u = new URL(v, "https://x.invalid" + esPath);
  let target = decodeURI(u.pathname);
  if (isNav) target = enPathFor(target) || target;
  const suffix = u.search + u.hash;
  if (v.startsWith("/")) return encodeURI(target) + suffix;
  return encodeURI(relativeUrl(enPath, target)) + suffix;
}

function rewriteSrcset(val, esPath, enPath) {
  return val
    .split(",")
    .map((part) => {
      const m = part.trim().match(/^(\S+)(\s+.*)?$/);
      if (!m) return part;
      return rewriteUrl(m[1], esPath, enPath, false) + (m[2] || "");
    })
    .join(", ");
}

const NAV_TAGS = new Set(["A", "AREA"]);
const ASSET_ATTRS = ["src", "poster", "data-src", "data-poster"];

function rewriteDocumentUrls(doc, esPath, enPath) {
  for (const el of doc.querySelectorAll("[href]")) {
    if (el.tagName === "LINK" && /\b(canonical|alternate)\b/i.test(el.getAttribute("rel") || "")) continue;
    el.setAttribute("href", rewriteUrl(el.getAttribute("href"), esPath, enPath, NAV_TAGS.has(el.tagName)));
  }
  for (const el of doc.querySelectorAll("form[action]")) {
    el.setAttribute("action", rewriteUrl(el.getAttribute("action"), esPath, enPath, true));
  }
  for (const attr of ASSET_ATTRS) {
    for (const el of doc.querySelectorAll(`[${attr}]`)) {
      el.setAttribute(attr, rewriteUrl(el.getAttribute(attr), esPath, enPath, false));
    }
  }
  for (const attr of ["srcset", "data-srcset"]) {
    for (const el of doc.querySelectorAll(`[${attr}]`)) {
      el.setAttribute(attr, rewriteSrcset(el.getAttribute(attr), esPath, enPath));
    }
  }
}

const LD_SKIP_KEYS = new Set([
  "@context", "@type", "@id", "url", "item", "image", "logo", "email", "telephone", "sameAs",
  "datePublished", "dateModified", "priceRange", "streetAddress", "addressLocality", "addressRegion",
  "addressCountry", "postalCode", "latitude", "longitude", "totalTime", "priceCurrency", "price",
]);

function translateLd(node, phrases, key) {
  if (Array.isArray(node)) return node.map((n) => translateLd(n, phrases, key));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = translateLd(v, phrases, k);
    return out;
  }
  if (typeof node !== "string") return node;
  if (key === "inLanguage") return /^es/i.test(node) ? "en" : node;
  if (isSiteUrl(node)) {
    if (!/^https?:\/\/(www\.)?landadvisors\.cl\//i.test(node)) return node;
    const u = new URL(node);
    const en = enPathFor(u.pathname);
    return en ? SITE_URL + en + u.search + u.hash : node;
  }
  if (LD_SKIP_KEYS.has(key)) return node;
  const norm = node.replace(/\s+/g, " ").trim();
  return Object.prototype.hasOwnProperty.call(phrases, norm) ? phrases[norm] : node;
}

function setMeta(doc, attr, name, content) {
  let el = doc.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = doc.createElement("meta");
    el.setAttribute(attr, name);
    doc.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function applySeoHead(doc, esPath, enPath) {
  const esUrl = SITE_URL + esPath;
  const enUrl = SITE_URL + enPath;

  let canonical = doc.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = doc.createElement("link");
    canonical.setAttribute("rel", "canonical");
    doc.head.insertBefore(canonical, doc.querySelector("title"));
  }
  canonical.setAttribute("href", enUrl);

  doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  let anchor = canonical;
  for (const [lang, href] of [["es", esUrl], ["en", enUrl], ["x-default", esUrl]]) {
    const link = doc.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", lang);
    link.setAttribute("href", href);
    anchor.after(doc.createTextNode("\n  "), link);
    anchor = link;
  }

  setMeta(doc, "property", "og:url", enUrl);
  setMeta(doc, "property", "og:locale", "en_US");
  setMeta(doc, "property", "og:locale:alternate", "es_CL");
}

function buildPage(esPath, enPath) {
  const file = path.join(ROOT, esPath, "index.html");
  if (!fs.existsSync(file)) throw new Error(`Falta HTML español: ${file}`);
  const html = fs.readFileSync(file, "utf8");

  const dom = new JSDOM(html, { url: SITE_URL + esPath, runScripts: "outside-only" });
  const { window } = dom;
  const doc = window.document;
  const pageType = doc.body.getAttribute("data-page") || "seo";
  const pageDict =
    pageType === "home" ? DICTS.home : pageType === "plh" ? DICTS.plh : DICTS.seo;
  const dict = Object.assign({}, DICTS.common, pageDict);

  const esTitle = doc.title;
  window.__LA_I18N_PRERENDER = true;
  window.eval(I18N_SRC);
  window.LA_i18n.apply(dict, "en");

  const root = doc.documentElement;
  root.setAttribute("lang", "en");
  root.classList.remove("i18n-loading");
  if (!root.getAttribute("class")) root.removeAttribute("class");
  const depth = enPath.split("/").filter(Boolean).length;
  root.setAttribute("data-i18n-prefix", "../".repeat(depth));

  applySeoHead(doc, esPath, enPath);
  rewriteDocumentUrls(doc, esPath, enPath);

  const phrases = Object.assign({}, dict._commonPhrases, dict._phrases);
  const pageEn = dict.pages?.[esPath]?.en;
  if (pageEn) {
    const pageEs = dict.pages[esPath].es || {};
    for (const k of ["title", "description", "h1"]) {
      if (pageEs[k] && pageEn[k]) phrases[pageEs[k].replace(/\s+/g, " ").trim()] = pageEn[k];
    }
  }
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      const data = translateLd(JSON.parse(s.textContent), phrases, "");
      s.textContent = JSON.stringify(data);
    } catch (e) {
      console.warn(`  JSON-LD no parseable en ${esPath}: ${e.message}`);
    }
  });

  const out = path.join(ROOT, enPath, "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, dom.serialize(), "utf8");
  const enTitle = doc.title;
  window.close();
  return { esTitle, enTitle };
}

const enDir = path.join(ROOT, "en");
fs.rmSync(enDir, { recursive: true, force: true });

let count = 0;
const untranslated = [];
for (const [esPath, enPath] of Object.entries(routes)) {
  const { esTitle, enTitle } = buildPage(esPath, enPath);
  if (esTitle === enTitle) untranslated.push(esPath);
  count++;
}
console.log(`wrote ${count} EN pages in /en/`);
if (untranslated.length) console.warn("  title sin versión EN:", untranslated.join(", "));
