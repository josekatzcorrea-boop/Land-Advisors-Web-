#!/usr/bin/env node
/**
 * Valida la arquitectura bilingüe estática: canonical, hreflang, og, lang, enlaces internos y sitemap.
 * Uso: node scripts/validate-i18n-seo.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "seo/site.json"), "utf8"));
const SITE_URL = site.url.replace(/\/$/, "");
const routes = JSON.parse(fs.readFileSync(path.join(ROOT, "seo/i18n-routes.json"), "utf8")).routes;
const esWithEn = new Set(Object.keys(routes));

const errors = [];
const warn = [];
const err = (p, m) => errors.push(`${p}: ${m}`);

function load(p) {
  const html = fs.readFileSync(path.join(ROOT, p, "index.html"), "utf8");
  return new JSDOM(html).window.document;
}

function fileExistsForPath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  const f = path.join(ROOT, clean);
  if (clean.endsWith("/")) return fs.existsSync(path.join(f, "index.html"));
  return fs.existsSync(f);
}

function resolveLocal(pagePath, ref) {
  if (!ref || /^(#|mailto:|tel:|data:|javascript:|blob:)/i.test(ref)) return null;
  if (/^(https?:)?\/\//i.test(ref)) {
    if (!/^https?:\/\/(www\.)?landadvisors\.cl(\/|$)/i.test(ref)) return null;
    return new URL(ref).pathname || "/";
  }
  return new URL(ref, "https://x.invalid" + pagePath).pathname;
}

function checkPage(p, lang, counterpart) {
  const doc = load(p);
  const selfUrl = SITE_URL + p;
  const html = doc.documentElement;
  if (html.getAttribute("lang") !== lang) err(p, `html lang=${html.getAttribute("lang")} (esperado ${lang})`);
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
  if (canonical !== selfUrl) err(p, `canonical=${canonical}`);
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute("content") || "";
  if (/noindex/i.test(robots)) err(p, "noindex");
  const alt = {};
  doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => (alt[l.getAttribute("hreflang")] = l.getAttribute("href")));
  const esUrl = SITE_URL + (lang === "es" ? p : counterpart);
  const enUrl = SITE_URL + (lang === "en" ? p : counterpart);
  if (alt.es !== esUrl) err(p, `hreflang es=${alt.es}`);
  if (alt.en !== enUrl) err(p, `hreflang en=${alt.en}`);
  if (alt["x-default"] !== esUrl) err(p, `x-default=${alt["x-default"]}`);
  if (Object.keys(alt).length !== 3) err(p, `hreflang count ${Object.keys(alt).length}`);
  const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute("content");
  if (ogUrl !== selfUrl) err(p, `og:url=${ogUrl}`);
  const ogLocale = doc.querySelector('meta[property="og:locale"]')?.getAttribute("content");
  if (ogLocale !== (lang === "en" ? "en_US" : "es_CL")) err(p, `og:locale=${ogLocale}`);
  for (const k of ['meta[property="og:title"]', 'meta[property="og:description"]', 'meta[name="description"]']) {
    if (!doc.querySelector(k)?.getAttribute("content")) err(p, `falta ${k}`);
  }
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      const txt = s.textContent;
      JSON.parse(txt);
      if (lang === "en" && /"inLanguage":"es/i.test(txt)) err(p, "JSON-LD inLanguage es");
      if (lang === "en") {
        for (const es of esWithEn) {
          if (es !== "/" && txt.includes(`"${SITE_URL}${es}`)) err(p, `JSON-LD URL ES ${es}`);
        }
      }
    } catch (e) {
      err(p, "JSON-LD inválido");
    }
  });

  const refs = [];
  doc.querySelectorAll("a[href], link[href]:not([rel=canonical]):not([rel=alternate]):not([rel=preconnect]), [src], [poster]").forEach((el) => {
    for (const a of ["href", "src", "poster"]) if (el.hasAttribute(a)) refs.push([el.tagName, el.getAttribute(a)]);
  });
  doc.querySelectorAll("[srcset]").forEach((el) =>
    el.getAttribute("srcset").split(",").forEach((part) => refs.push([el.tagName, part.trim().split(/\s+/)[0]]))
  );
  for (const [tag, ref] of refs) {
    const local = resolveLocal(p, ref);
    if (local == null) continue;
    if (!fileExistsForPath(local)) err(p, `enlace roto ${tag} ${ref}`);
    if (lang === "en" && tag === "A" && esWithEn.has(local)) err(p, `enlace EN→ES ${ref}`);
    if (lang === "es" && tag === "A" && /^\/en\//.test(local)) err(p, `enlace ES→EN ${ref}`);
  }
  return { title: doc.title, description: doc.querySelector('meta[name="description"]')?.getAttribute("content") };
}

for (const [es, en] of Object.entries(routes)) {
  if (!fileExistsForPath(es)) { err(es, "no existe"); continue; }
  if (!fileExistsForPath(en)) { err(en, "no existe"); continue; }
  const a = checkPage(es, "es", en);
  const b = checkPage(en, "en", es);
  if (a.title === b.title) err(en, `title igual al ES: ${b.title}`);
  if (a.description === b.description) err(en, "description igual al ES");
}

const sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (new Set(locs).size !== locs.length) err("sitemap", "URLs duplicadas");
for (const loc of locs) {
  if (loc.includes("?")) err("sitemap", `URL con parámetros ${loc}`);
  const p = new URL(loc).pathname;
  if (!fileExistsForPath(p)) err("sitemap", `no existe ${loc}`);
  else {
    const robots = load(p).querySelector('meta[name="robots"]')?.getAttribute("content") || "";
    if (/noindex/.test(robots)) err("sitemap", `noindex ${loc}`);
  }
}
for (const [es, en] of Object.entries(routes)) {
  if (!locs.includes(SITE_URL + es)) err("sitemap", `falta ${es}`);
  if (!locs.includes(SITE_URL + en)) err("sitemap", `falta ${en}`);
}
const robotsTxt = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
if (/Disallow:\s*\/en\b/i.test(robotsTxt) || /Disallow:\s*\/\s*$/m.test(robotsTxt)) err("robots.txt", "bloquea /en/");

console.log(`páginas: ${Object.keys(routes).length} ES + ${Object.keys(routes).length} EN · sitemap: ${locs.length} URLs`);
if (warn.length) console.log("avisos:\n  " + warn.join("\n  "));
if (errors.length) {
  console.log(`ERRORES (${errors.length}):\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log("OK: sin errores");
