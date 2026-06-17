#!/usr/bin/env node
/**
 * Genera páginas SEO secundarias y sitemap.xml desde landing/seo/
 * Uso: node scripts/build-seo.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SEO = path.join(ROOT, "seo");

const site = JSON.parse(fs.readFileSync(path.join(SEO, "site.json"), "utf8"));
const pages = JSON.parse(fs.readFileSync(path.join(SEO, "pages.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(SEO, "services-catalog.json"), "utf8"));

function depthFromPath(p) {
  const segs = p.replace(/\/$/, "").split("/").filter(Boolean);
  return segs.length;
}

function assetPrefix() {
  // Root-absolute: works in production (landing/ = site root) and local serve.ps1 (Contexto root).
  return "/assets/";
}

function rootPrefix(pagePath) {
  const d = depthFromPath(pagePath);
  return d === 0 ? "" : "../".repeat(d);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHead(page, prefix, assets) {
  const url = site.url + (page.path === "/" ? "/" : page.path);
  const ogImage = site.url + site.defaultOgImage;
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="author" content="Land Advisors Chile">
  <meta name="geo.region" content="CL-LL">
  <meta name="geo.placename" content="Puerto Varas">
  <link rel="canonical" href="${url}">
  <title>${esc(page.title)}</title>
  <link rel="icon" type="image/png" href="${assets}logo-isotipo-3d.png">
  <link rel="apple-touch-icon" href="${assets}logo-isotipo-3d.png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_CL">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}styles.css">
  <link rel="stylesheet" href="${prefix}styles-seo.css">
  <link rel="stylesheet" href="${prefix}chat-widget.css">`;
}

function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: site.url + "/assets/logo-horizontal-3d.jpg",
    email: site.email,
    telephone: site.phone,
    description: "Consultoría de inteligencia territorial e inversión inmobiliaria rural y periurbana en el sur de Chile.",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: site.areasServed.map((name) => ({ "@type": "City", name })),
    founder: { "@type": "Person", name: site.founder.name },
  };
}

function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    image: site.url + site.defaultOgImage,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    priceRange: "UF",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    areaServed: site.areasServed,
    description: "Consultoría inmobiliaria especializada en inversión territorial, plusvalía y oportunidades en el sur de Chile.",
  };
}

function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.founder.name,
    jobTitle: site.founder.jobTitle,
    worksFor: { "@type": "Organization", name: site.name },
    url: site.founder.url,
  };
}

function serviceSchema(svc) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: svc.name,
    description: svc.description,
    provider: { "@type": "Organization", name: site.name, url: site.url },
    areaServed: site.areasServed,
    offers: {
      "@type": "Offer",
      price: svc.price,
      priceCurrency: "CLF",
      availability: "https://schema.org/InStock",
    },
  };
}

function breadcrumbSchema(page, crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

function buildSchemas(page) {
  const schemas = [orgSchema(), localBusinessSchema(), personSchema()];
  const crumbs = [{ name: "Inicio", url: site.url + "/" }];
  if (page.path !== "/") {
    const parts = page.path.split("/").filter(Boolean);
    let acc = "";
    parts.forEach((part, i) => {
      acc += part + "/";
      const match = pages.find((p) => p.path === "/" + acc || p.path === "/" + acc.slice(0, -1));
      crumbs.push({
        name: match?.breadcrumb || part,
        url: site.url + "/" + acc,
      });
    });
  }
  schemas.push(breadcrumbSchema(page, crumbs));
  if (page.service) schemas.push(serviceSchema(page.service));
  return schemas;
}

function navLinks(prefix) {
  return `        <nav id="main-nav" class="nav" aria-label="Principal">
          <div class="nav-links">
            <a href="${prefix}#problema">Situación</a>
            <a href="${prefix}servicios/">Servicios</a>
            <a href="${prefix}territorios/">Territorios</a>
            <a href="${prefix}casos-de-estudio/">Casos</a>
            <a href="${prefix}blog/">Blog</a>
            <a href="${prefix}#nosotros">Nosotros</a>
          </div>
          <a href="${prefix}#contacto-form" class="nav-cta" data-track="cta_diagnostico">Diagnóstico estratégico</a>
        </nav>`;
}

function hubCards(type, prefix) {
  if (type === "hub" && prefix.includes("servicios")) {
    const items = pages.filter((p) => p.type === "service");
    return `<div class="seo-card-grid">${items
      .map(
        (p) => `<article class="seo-card glass-card">
        <h2><a href="${prefix}${p.file.replace("servicios/", "").replace("/index.html", "/")}">${esc(p.breadcrumb)}</a></h2>
        <p>${esc(p.intro)}</p>
        <a href="${prefix}${p.file.replace("servicios/", "").replace("/index.html", "/")}" class="btn btn-glass">Ver servicio →</a>
      </article>`
      )
      .join("")}</div>`;
  }
  if (type === "hub" && prefix.includes("territorios")) {
    const items = pages.filter((p) => p.type === "territory");
    return `<div class="seo-card-grid">${items
      .map(
        (p) => `<article class="seo-card glass-card">
        <h2><a href="${p.breadcrumb.toLowerCase().replace(/ /g, "-") === "puerto varas" ? "puerto-varas/" : p.file.replace("territorios/", "").replace("/index.html", "/")}">${esc(p.breadcrumb)}</a></h2>
        <p>${esc(p.intro)}</p>
      </article>`
      )
      .join("")}</div>`;
  }
  return "";
}

function territoryLinks(prefix) {
  const items = pages.filter((p) => p.type === "territory");
  return items
    .map((p) => {
      const slug = p.file.replace("territorios/", "").replace("/index.html", "");
      return `<article class="seo-card glass-card">
      <h2><a href="${prefix}territorios/${slug}/">${esc(p.breadcrumb)}</a></h2>
      <p>${esc(p.intro)}</p>
      <a href="${prefix}territorios/${slug}/" class="btn btn-glass">Inversión en ${esc(p.breadcrumb)} →</a>
    </article>`;
    })
    .join("");
}

function catalogBySlug(slug) {
  return catalog.services.find((s) => s.slug === slug);
}

function serviceIconSvg(num) {
  const icons = {
    "01": `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="11" stroke="currentColor" stroke-width="1.75"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/><path d="M16 5v4M16 23v4M5 16h4M23 16h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M8.5 8.5l2.8 2.8M20.7 20.7l2.8 2.8M23.5 8.5l-2.8 2.8M11.3 20.7l-2.8 2.8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
    "02": `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="13.5" cy="13.5" r="7" stroke="currentColor" stroke-width="1.75"/><path d="M19 19l7.5 7.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M13.5 10.5v6M10.5 13.5h6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M13.5 22.5c4.5 0 8-2.5 8-5.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
    "03": `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 18c0-4 3.5-7 10-7s10 3 10 7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M9 18c1.5 2.5 4 4 7 4s5.5-1.5 7-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M11 22l-2 6M21 22l2 6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><rect x="12" y="8" width="8" height="10" rx="1" stroke="currentColor" stroke-width="1.75"/><path d="M14 11h4M14 14h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    "04": `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 24l5-8 5 4 5-10 5 6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 26h20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M22 6l2 2-4 4-2-2 4-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="22" cy="8" r="1.25" fill="currentColor"/></svg>`,
    "05": `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 26V14l8-6 8 6v12" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 26v-8h8v8" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M14 18h4M14 21h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M4 26h24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  };
  return icons[num] || "";
}

function serviceDeliverablesBlock(svc) {
  let html = "";
  if (svc.objective) {
    html += `<p class="service-detail-objective">${esc(svc.objective)}</p>`;
  }
  html += `<ul class="service-detail-list">${svc.deliverables
    .map((item) => `<li>${esc(item)}</li>`)
    .join("")}</ul>`;
  svc.notes.forEach((note) => {
    const highlight = note === svc.highlightNote ? " service-detail-note--highlight" : "";
    html += `<p class="service-detail-note${highlight}">${esc(note)}</p>`;
  });
  return html;
}

function buildServicesGallery(prefix) {
  const g = catalog.gallery;
  if (!g?.images?.length) return "";
  const imgs = g.images
    .map((img) => {
      const pos = img.position ? ` style="object-position:${img.position}"` : "";
      return `<figure class="services-life-gallery__item"><img src="${prefix}servicios/images/${esc(img.file)}" alt="${esc(img.alt)}" width="900" height="600" loading="lazy" decoding="async"${pos}></figure>`;
    })
    .join("");
  return `<aside class="services-life-gallery" aria-label="${esc(g.ariaLabel || "Vida en el sur de Chile")}">
    <p class="services-life-gallery__label">${esc(g.eyebrow)}</p>
    <p class="services-life-gallery__phrase">${esc(g.phrase)}</p>
    <div class="services-life-gallery__grid">${imgs}</div>
  </aside>`;
}

function buildServicesCatalog(prefix) {
  const items = catalog.services
    .map((svc, index) => {
      const href = svc.slug ? `${prefix}servicios/${svc.slug}/` : `${prefix}#contacto-form`;
      const alt = index % 2 === 1 ? " services-catalog-item--alt" : "";
      const title = svc.slug
        ? `<a href="${href}">${esc(svc.title)}</a>`
        : esc(svc.title);
      return `<article class="services-catalog-item glass-card${alt}">
      <div class="services-catalog-head">
        <span class="services-catalog-icon" aria-hidden="true">${serviceIconSvg(svc.num)}</span>
        <div class="services-catalog-heading">
          <span class="services-catalog-num">${esc(svc.num)}</span>
          <h2>${title}</h2>
          <p class="services-catalog-price">${esc(svc.price)}</p>
        </div>
      </div>
      ${serviceDeliverablesBlock(svc)}
      <a href="${href}" class="service-card-link" data-track="${esc(svc.cta.event)}">${esc(svc.cta.label)}</a>
    </article>`;
    })
    .join("\n");

  return `${buildServicesGallery(prefix)}
    <p class="services-catalog-price-note">${esc(catalog.priceNote)}</p>
    <div class="services-catalog-list" role="list">${items}</div>
    <p class="services-catalog-legal">${esc(catalog.legal)}</p>`;
}

function buildSecondaryPage(page) {
  const prefix = rootPrefix(page.path);
  const assets = assetPrefix();
  const schemas = buildSchemas(page);
  const cta = page.cta || { label: "Agendar reunión estratégica", event: "cta_contacto" };
  const ctaHref = prefix + "#contacto-form";

  let extraContent = "";
  if (page.path === "/servicios/") extraContent = buildServicesCatalog(prefix);
  else if (page.path === "/territorios/") extraContent = `<div class="seo-card-grid">${territoryLinks(prefix)}</div>`;
  else if (page.path === "/casos-de-estudio/") {
    extraContent = `<div class="seo-card-grid">
      <article class="seo-card glass-card"><h2>Puerto Varas</h2><p>De restricción rural a vocación comercial: arbitraje con alzamiento de prohibición y captura de plusvalía.</p><a href="${prefix}#casos" class="btn btn-glass">Ver en inicio →</a></article>
      <article class="seo-card glass-card"><h2>Frutillar</h2><p>Oportunidad en brecha de precio y liquidez del vendedor.</p><a href="${prefix}#casos" class="btn btn-glass">Ver en inicio →</a></article>
      <article class="seo-card glass-card"><h2>Llanquihue</h2><p>Valor presente vs. valor futuro en proyecto a medio urbanizar.</p><a href="${prefix}#casos" class="btn btn-glass">Ver en inicio →</a></article>
    </div>`;
  } else if (page.path === "/blog/") {
    extraContent = `<div class="seo-blog-soon glass-card">
      <p class="section-label">Próximamente</p>
      <h2>Artículos en preparación</h2>
      <ul class="seo-topic-list">
        <li>Plusvalía inmobiliaria en el contorno rural de Puerto Varas</li>
        <li>Expansión urbana y oportunidades de inversión territorial</li>
        <li>Cambio de uso de suelo: cuándo tiene sentido económico</li>
        <li>Turismo inmobiliario en la cuenca del Lago Llanquihue</li>
        <li>Mercado inmobiliario del sur de Chile: lectura para inversionistas</li>
      </ul>
    </div>`;
  } else if (page.type === "territory" && page.keywords) {
    extraContent = `<p class="seo-keywords">Búsquedas relacionadas: ${page.keywords.map(esc).join(" · ")}</p>`;
  } else if (page.type === "service") {
    const slug = page.path.split("/").filter(Boolean).pop();
    const svc = catalogBySlug(slug);
    if (svc) extraContent = `<div class="service-detail glass-card">${serviceDeliverablesBlock(svc)}</div>`;
  }

  const serviceBlock =
    page.service
      ? `<div class="seo-service-meta glass-card">
      <p><strong>Inversión:</strong> ${esc(page.service.price)}</p>
      <p>${esc(page.service.description)}</p>
    </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
${buildHead(page, prefix, assets)}
  <script type="application/ld+json">${JSON.stringify(schemas[0])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[1])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[2])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[3])}</script>
  ${page.service ? `<script type="application/ld+json">${JSON.stringify(schemas[4])}</script>` : ""}
</head>
<body class="site-v2 seo-page${page.path === "/servicios/" ? " seo-page--servicios" : ""}">
  <header class="site-header">
    <div class="header-shell">
      <div class="header-inner">
        <a href="${prefix}" class="logo-link" aria-label="Land Advisors — inicio">
          <img src="${assets}logo-horizontal-3d.jpg" alt="Land Advisors — Estrategia Inmobiliaria" width="280" height="64">
        </a>
        <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="main-nav">Menú</button>
${navLinks(prefix)}
      </div>
    </div>
  </header>

  <main>
    <section class="seo-hero">
      <div class="container" data-reveal>
        <nav class="seo-breadcrumb" aria-label="Breadcrumb">
          <a href="${prefix}">Inicio</a>
          ${page.path !== "/" ? `<span aria-hidden="true"> / </span><span>${esc(page.breadcrumb)}</span>` : ""}
        </nav>
        <p class="section-label">${esc(page.type === "service" ? "Servicio" : page.type === "territory" ? "Territorio" : page.breadcrumb)}</p>
        <h1>${esc(page.h1)}</h1>
        <p class="section-intro">${esc(page.intro)}</p>
        ${serviceBlock}
        <div class="seo-hero-actions">
          <a href="${ctaHref}" class="btn btn-primary btn-glow" data-track="${cta.event}">${esc(cta.label)}</a>
          <a href="${site.whatsapp}" class="btn btn-glass" target="_blank" rel="noopener noreferrer" data-track="cta_whatsapp">WhatsApp</a>
        </div>
      </div>
    </section>
    <section class="seo-body">
      <div class="container" data-reveal>
        ${extraContent}
      </div>
    </section>
    <section class="cta-band">
      <div class="container">
        <h2>Inteligencia territorial antes de invertir</h2>
        <p>Reunión estratégica para ordenar tu decisión con criterio de mercado y territorio.</p>
        <a href="${ctaHref}" class="btn btn-primary btn-glow" data-track="cta_contacto">Agendar reunión estratégica</a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <img src="${assets}logo-isotipo-3d.png" alt="Land Advisors" class="footer-isotipo" width="72" height="72">
      <p class="footer-address">${esc(site.address.street)}, ${esc(site.address.locality)} · ${esc(site.address.region)}</p>
      <p class="footer-copy">© <span id="year"></span> Land Advisors Chile · ${esc(site.tagline)} · Sur de Chile${site.social?.instagram ? ` <a href="${esc(site.social.instagram)}" class="footer-social__link" target="_blank" rel="noopener noreferrer" aria-label="Instagram — Land Advisors Chile" data-track="cta_instagram"><svg class="footer-social__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm11 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg></a>` : ""}</p>
    </div>
  </footer>

  <div id="la-chat-widget" aria-label="Contacto"></div>
  <script>document.getElementById("year").textContent = new Date().getFullYear();</script>
  <script src="${prefix}landing-ui.js" defer></script>
  <script src="${prefix}analytics-config.js" defer></script>
  <script src="${prefix}analytics.js" defer></script>
  <script src="${prefix}conversion-tracking.js" defer></script>
  <script src="${prefix}chat-widget.js" defer></script>
  <script>
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
  </script>
</body>
</html>`;
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => {
      const loc = site.url + (p.path === "/" ? "/" : p.path);
      const priority = p.path === "/" ? "1.0" : p.type === "service" || p.type === "territory" ? "0.8" : "0.7";
      const changefreq = p.type === "blog" ? "weekly" : "monthly";
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// Generate secondary pages (skip home — edited manually)
for (const page of pages) {
  if (page.path === "/" || !page.file || page.file === "index.html") continue;
  const out = path.join(ROOT, page.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buildSecondaryPage(page), "utf8");
  console.log("wrote", page.file);
}

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), buildSitemap(), "utf8");
console.log("wrote sitemap.xml");
