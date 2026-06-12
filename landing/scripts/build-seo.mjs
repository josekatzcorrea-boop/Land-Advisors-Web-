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

function depthFromPath(p) {
  const segs = p.replace(/\/$/, "").split("/").filter(Boolean);
  return segs.length;
}

function assetPrefix(pagePath) {
  const d = depthFromPath(pagePath);
  return d === 0 ? "assets/" : "../".repeat(d) + "assets/";
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
  <link rel="icon" type="image/png" href="${assets}logo-isotipo.png">
  <link rel="apple-touch-icon" href="${assets}logo-isotipo.png">
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
    logo: site.url + "/assets/logo-horizontal.png",
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
          <a href="${prefix}#contacto" class="nav-cta" data-track="cta_diagnostico">Diagnóstico estratégico</a>
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

function serviceLinks(prefix) {
  const items = pages.filter((p) => p.type === "service");
  return items
    .map((p) => {
      const slug = p.file.replace("servicios/", "").replace("/index.html", "");
      return `<article class="seo-card glass-card">
      <h2><a href="${prefix}servicios/${slug}/">${esc(p.breadcrumb)}</a></h2>
      <p>${esc(p.intro)}</p>
      ${p.service ? `<p class="seo-price">${esc(p.service.price)}</p>` : ""}
      <a href="${prefix}servicios/${slug}/" class="btn btn-glass">Ver servicio →</a>
    </article>`;
    })
    .join("");
}

function buildSecondaryPage(page) {
  const prefix = rootPrefix(page.path);
  const assets = assetPrefix(page.path);
  const schemas = buildSchemas(page);
  const cta = page.cta || { label: "Agendar reunión estratégica", event: "cta_contacto" };
  const ctaHref = prefix + "#contacto";

  let extraContent = "";
  if (page.path === "/servicios/") extraContent = `<div class="seo-card-grid">${serviceLinks(prefix)}</div>`;
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
<body class="site-v2 seo-page">
  <header class="site-header">
    <div class="header-shell">
      <div class="header-inner">
        <a href="${prefix}" class="logo-link" aria-label="Land Advisors — inicio">
          <img src="${assets}logo-horizontal.png" alt="Land Advisors — Estrategia Inmobiliaria" width="280" height="64">
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
      <img src="${assets}logo-isotipo.png" alt="Land Advisors" class="footer-isotipo" width="72" height="72">
      <p class="footer-address">${esc(site.address.street)}, ${esc(site.address.locality)} · ${esc(site.address.region)}</p>
      <p>© <span id="year"></span> Land Advisors Chile · ${esc(site.tagline)} · Sur de Chile</p>
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
