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
const blogData = JSON.parse(fs.readFileSync(path.join(SEO, "posts.json"), "utf8"));
const blogPosts = blogData.posts || [];
const retiredPosts = blogData.retired || [];
const casesData = JSON.parse(fs.readFileSync(path.join(SEO, "cases.json"), "utf8"));
const caseStudies = casesData.cases || [];
const guidesData = JSON.parse(fs.readFileSync(path.join(SEO, "guides.json"), "utf8"));
const guides = guidesData.guides || [];
const campaignsData = JSON.parse(fs.readFileSync(path.join(SEO, "campaigns.json"), "utf8"));
const campaigns = campaignsData.campaigns || [];

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

function buildHead(page, prefix, assets, options = {}) {
  const url = site.url + (page.path === "/" ? "/" : page.path);
  const ogImage = options.ogImage || site.url + (page.image || site.defaultOgImage);
  const ogType = options.ogType || "website";
  const verificationMeta = [
    site.seo?.googleSiteVerification
      ? `  <meta name="google-site-verification" content="${esc(site.seo.googleSiteVerification)}">`
      : "",
    site.seo?.bingSiteVerification
      ? `  <meta name="msvalidate.01" content="${esc(site.seo.bingSiteVerification)}">`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="author" content="Land Advisors Chile">
  <meta name="geo.region" content="CL-LL">
  <meta name="geo.placename" content="Puerto Varas">
${verificationMeta ? verificationMeta + "\n" : ""}  <link rel="canonical" href="${url}">
  <title>${esc(page.title)}</title>
  <link rel="icon" type="image/png" href="${assets}logo-isotipo-3d.png">
  <link rel="apple-touch-icon" href="${assets}logo-isotipo-3d.png">
  <meta property="og:type" content="${ogType}">
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

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: "Consultoría de inteligencia territorial e inversión inmobiliaria en el sur de Chile.",
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    inLanguage: "es-CL",
  };
}

function faqPageSchema(faqItems) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
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
  const sameAs = [site.social?.linkedin, site.social?.instagram].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.founder.name,
    jobTitle: site.founder.jobTitle,
    worksFor: { "@type": "Organization", name: site.name },
    url: site.founder.url,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function formatContentDate(iso) {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildEeatByline(content, prefix) {
  const author = content.author || site.founder.name;
  const published = content.datePublished;
  const modified = content.dateModified || published;
  const readMin = content.readMinutes;
  const metaParts = [];
  if (published) {
    metaParts.push(
      `Publicado <time datetime="${esc(published)}">${esc(formatContentDate(published))}</time>`
    );
  }
  if (modified) {
    metaParts.push(
      `Actualizado <time datetime="${esc(modified)}">${esc(formatContentDate(modified))}</time>`
    );
  }
  if (readMin) metaParts.push(`${readMin} min lectura`);
  return `<div class="eeat-byline">
      <p class="eeat-byline__author">Por <a href="${prefix}#nosotros">${esc(author)}</a> · Consultoría territorial · Land Advisors Chile</p>
      ${metaParts.length ? `<p class="eeat-byline__meta">${metaParts.join(" · ")}</p>` : ""}
    </div>`;
}

function articleSchema(article, pagePath) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.h1,
    description: article.description,
    image: site.url + article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author || site.founder.name,
      url: site.founder.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: site.url + "/assets/logo-horizontal-3d.jpg" },
    },
    mainEntityOfPage: site.url + pagePath,
  };
}

function caseStudySchema(caseStudy, pagePath) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": site.url + pagePath,
    headline: caseStudy.h1,
    description: caseStudy.description,
    image: site.url + caseStudy.image,
    datePublished: caseStudy.datePublished,
    dateModified: caseStudy.dateModified || caseStudy.datePublished,
    author: { "@type": "Person", name: caseStudy.author || site.founder.name },
    publisher: { "@type": "Organization", name: site.name },
    articleSection: "Casos de estudio",
    about: { "@type": "Place", name: caseStudy.territory },
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

function blogPostSchema(post, pagePath) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.h1,
    description: post.description,
    image: site.url + post.image,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      "@type": "Person",
      name: post.author || site.founder.name,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: site.url + "/assets/logo-horizontal-3d.jpg" },
    },
    mainEntityOfPage: site.url + pagePath,
    keywords: (post.tags || []).join(", "),
  };
}

function buildInternalLinks(page, prefix) {
  const links = [];
  const p = page.path || "";

  if (page.type === "territory") {
    links.push(
      { href: `${prefix}guias/`, label: "Guía: comprar terreno en el sur" },
      { href: `${prefix}servicios/busqueda-personalizada/`, label: "Búsqueda personalizada de terrenos" },
      { href: `${prefix}blog/plusvalia-contorno-rural-puerto-varas/`, label: "Plusvalía en contorno rural" }
    );
  } else if (page.type === "blog-post") {
    links.push(
      { href: `${prefix}guias/`, label: "Guía: comprar terreno en el sur" },
      { href: `${prefix}servicios/busqueda-personalizada/`, label: "Búsqueda personalizada" },
      { href: `${prefix}territorios/`, label: "Territorios" }
    );
  } else if (page.type === "service") {
    links.push(
      { href: `${prefix}guias/`, label: "Guía para comprar terreno" },
      { href: `${prefix}territorios/`, label: "Territorios donde operamos" },
      { href: `${prefix}blog/`, label: "Blog de inteligencia territorial" }
    );
  } else if (p === "/blog/") {
    links.push(
      { href: `${prefix}guias/`, label: "Guías para comprar terreno" },
      { href: `${prefix}servicios/diagnostico-estrategico/`, label: "Diagnóstico estratégico (1 UF)" },
      { href: `${prefix}territorios/puerto-varas/`, label: "Inversión en Puerto Varas" }
    );
  } else if (p === "/guias/") {
    links.push(
      { href: `${prefix}servicios/busqueda-personalizada/`, label: "Búsqueda personalizada" },
      { href: `${prefix}blog/`, label: "Artículos del blog" },
      { href: `${prefix}casos-de-estudio/`, label: "Casos de estudio" }
    );
  } else if (p === "/casos-de-estudio/") {
    links.push(
      { href: `${prefix}guias/`, label: "Guía: comprar terreno en el sur" },
      { href: `${prefix}blog/plusvalia-contorno-rural-puerto-varas/`, label: "Plusvalía en contorno rural" },
      { href: `${prefix}territorios/`, label: "Territorios" }
    );
  } else if (page.type === "case-study") {
    links.push(
      { href: `${prefix}casos-de-estudio/`, label: "Todos los casos" },
      { href: `${prefix}guias/`, label: "Guía para comprar terreno" },
      { href: `${prefix}servicios/busqueda-personalizada/`, label: "Búsqueda personalizada" }
    );
  }

  if (!links.length) return "";
  const items = links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("");
  return `<nav class="seo-internal-links glass-card" aria-label="Enlaces relacionados">
      <p class="section-label">Sigue leyendo</p>
      <ul>${items}</ul>
    </nav>`;
}

function hubGuideForPage(page) {
  const slug = page.primaryGuide || guides[0]?.slug;
  return slug ? guides.find((g) => g.slug === slug) : null;
}

function buildGuidesHubContent(page, prefix) {
  const guide = hubGuideForPage(page);
  if (!guide) return "";
  return buildGuideBody(guide, prefix, { skipLead: true });
}

function buildGuideBody(guide, prefix, options = {}) {
  const blocks = guide.blocks || guide.sections || [];
  const sections = blocks.map(renderGuideBlock).join("\n        ");
  const faq = (guide.faq || [])
    .map(
      (item) => `<details class="faq-item">
        <summary>${esc(item.q)}</summary>
        <div class="faq-answer"><p>${esc(item.a)}</p></div>
      </details>`
    )
    .join("");
  const related = (guide.related || [])
    .map((r) => `<li><a href="${prefix}${r.href}">${esc(r.label)}</a></li>`)
    .join("");

  const ctaHref = prefix + (guide.cta?.href || "servicios/busqueda-personalizada/");
  const ctaEvent = guide.cta?.event || "cta_busqueda";
  const ctaLabel = guide.cta?.label || "Solicitar búsqueda personalizada";

  return `<article class="blog-article blog-article--guide glass-card">
      <header class="blog-article__header">
        <figure class="blog-article__figure">
          <img src="${prefix}${guide.image.replace(/^\//, "")}" alt="${esc(guide.imageAlt || guide.h1)}" width="900" height="600" loading="lazy">
        </figure>
        ${buildEeatByline(guide, prefix)}
      </header>
      <div class="blog-article__content blog-article__content--guide">
        ${options.skipLead ? "" : `<p class="blog-article__lead">${esc(guide.intro)}</p>`}
        ${sections}
        <aside class="guide-callout glass-card guide-callout--la guide-callout--footer">
          <span class="guide-callout__icon" aria-hidden="true">${guideIcon("la")}</span>
          <div class="guide-callout__copy">
            <h2 class="guide-callout__title">¿Quieres que lo hagamos contigo?</h2>
            <p>En Land Advisors este proceso es nuestro trabajo diario: territorio, normativa, mercado y precio con criterio local. No vendemos terrenos — te ayudamos a comprar el correcto.</p>
            <a href="${ctaHref}" class="btn btn-primary btn-glow" data-track="${esc(ctaEvent)}">${esc(ctaLabel)}</a>
          </div>
        </aside>
      </div>
      ${
        faq
          ? `<section class="seo-guide-faq" aria-labelledby="guide-faq-title">
        <h2 id="guide-faq-title" class="blog-article__h2">Preguntas frecuentes</h2>
        <div class="faq-list">${faq}</div>
      </section>`
          : ""
      }
      ${
        related
          ? `<footer class="blog-article__footer">
        <nav class="blog-related" aria-label="Enlaces relacionados">
          <p class="blog-related__label">Relacionado</p>
          <ul>${related}</ul>
        </nav>
      </footer>`
          : ""
      }
    </article>`;
}

function buildGuideRedirectPage(guide) {
  const canonical = site.url + "/guias/";
  const redirectTarget = "/guias/";
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${canonical}">
  <meta http-equiv="refresh" content="0; url=${redirectTarget}">
  <title>${esc(guide.h1)} | Land Advisors</title>
  <script>location.replace("${redirectTarget}");</script>
</head>
<body>
  <p><a href="${redirectTarget}">Ir a ${esc(guide.h1)}</a></p>
</body>
</html>`;
}

function buildRetiredPostRedirect(entry) {
  const redirectTarget = "/" + entry.redirectTo.replace(/^\//, "");
  const canonical = site.url + redirectTarget;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${canonical}">
  <meta http-equiv="refresh" content="0; url=${redirectTarget}">
  <title>${esc(entry.title || "Artículo")} | Land Advisors</title>
  <script>location.replace("${redirectTarget}");</script>
</head>
<body>
  <p><a href="${redirectTarget}">Continuar leyendo →</a></p>
</body>
</html>`;
}

function buildGuidePage(guide) {
  return buildGuideRedirectPage(guide);
}

const GUIDE_ICONS = {
  map: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 24V10l8-4 12 6v14l-8-4-8 4V14l8-4" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><circle cx="14" cy="12" r="2.5" stroke="currentColor" stroke-width="1.75"/></svg>`,
  browse: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="14" cy="14" r="7" stroke="currentColor" stroke-width="1.75"/><path d="M20 20l7 7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M11 14h6M14 11v6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  filter: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 8h20M10 16h12M14 24h8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><circle cx="22" cy="8" r="2" fill="currentColor"/><circle cx="18" cy="16" r="2" fill="currentColor"/><circle cx="14" cy="24" r="2" fill="currentColor"/></svg>`,
  heart: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 27s-9-5.5-11.5-11C2.5 11 6 6.5 10.5 6.5c2.5 0 4 1.5 5.5 3 1.5-1.5 3-3 5.5-3C26 6.5 29.5 11 27.5 16 25 21.5 16 27 16 27z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>`,
  scale: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 6v20M8 26h16" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M10 14h12l-6 8-6-8z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>`,
  family: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="12" cy="11" r="3" stroke="currentColor" stroke-width="1.75"/><circle cx="22" cy="12" r="2.5" stroke="currentColor" stroke-width="1.75"/><path d="M6 26c0-4 3-7 6-7s6 3 6 7M18 26c0-3 2-5 4-5s4 2 4 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  cabin: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 26V14l10-8 10 8v12" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 26v-8h8v8" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M16 6v4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  budget: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.75"/><path d="M10 14h12M10 18h8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><circle cx="22" cy="18" r="2" stroke="currentColor" stroke-width="1.5"/></svg>`,
  services: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 14h16v12H8z" stroke="currentColor" stroke-width="1.75"/><path d="M12 14V10a4 4 0 018 0v4" stroke="currentColor" stroke-width="1.75"/><path d="M16 20v4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  road: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M10 26L14 6h4l4 20" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 18h8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  climate: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="5" stroke="currentColor" stroke-width="1.75"/><path d="M16 6v2M16 24v2M6 16h2M24 16h2M9 9l1.5 1.5M21.5 21.5L23 23M23 9l-1.5 1.5M10.5 21.5L9 23" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  normativa: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M10 6h12v20H10z" stroke="currentColor" stroke-width="1.75"/><path d="M13 11h6M13 15h6M13 19h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M6 26h20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  price: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 8c0 4 16 4 16 8s-16 4-16 8 16 4 16 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M8 8v16" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  connect: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="8" cy="22" r="3" stroke="currentColor" stroke-width="1.75"/><circle cx="24" cy="10" r="3" stroke="currentColor" stroke-width="1.75"/><path d="M10.5 20.5L21.5 11.5" stroke="currentColor" stroke-width="1.75"/></svg>`,
  habilitation: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 26V18l10-8 10 8v8" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 26v-6h8v6" stroke="currentColor" stroke-width="1.75"/><path d="M14 14h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  invest: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 24V14l8-6 8 6v10" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 24v-6h8v6" stroke="currentColor" stroke-width="1.75"/><path d="M16 8v4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  la: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 24V12l8-6 8 6v12" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 24v-6h8v6" stroke="currentColor" stroke-width="1.75"/></svg>`,
};

function guideIcon(name) {
  return GUIDE_ICONS[name] || GUIDE_ICONS.map;
}

function renderGuideBlock(block) {
  switch (block.type) {
    case "roadmap": {
      const items = (block.items || [])
        .map(
          (item) => `<li class="guide-roadmap__item">
        <span class="guide-roadmap__icon" aria-hidden="true">${guideIcon(item.icon)}</span>
        <span class="guide-roadmap__num">${esc(item.num)}</span>
        <strong class="guide-roadmap__title">${esc(item.title)}</strong>
        <span class="guide-roadmap__text">${esc(item.text)}</span>
      </li>`
        )
        .join("");
      return `<nav class="guide-roadmap glass-card" aria-label="${esc(block.title || "Pasos de la guía")}">
        <p class="section-label">${esc(block.label || "Ruta recomendada")}</p>
        ${block.title ? `<h2 class="guide-roadmap__heading">${esc(block.title)}</h2>` : ""}
        <ol class="guide-roadmap__list">${items}</ol>
      </nav>`;
    }
    case "step": {
      const paras = (block.paragraphs || []).map((t) => `<p>${esc(t)}</p>`).join("");
      const bullets = block.bullets?.length
        ? `<ul class="guide-step__bullets">${block.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
        : "";
      const examples = block.examples?.length
        ? `<div class="guide-example-grid">${block.examples
            .map(
              (ex) => `<article class="guide-example-card">
            <span class="guide-example-card__icon" aria-hidden="true">${guideIcon(ex.icon)}</span>
            <h3 class="guide-example-card__title">${esc(ex.title)}</h3>
            <p>${esc(ex.text)}</p>
          </article>`
            )
            .join("")}</div>`
        : "";
      return `<section class="guide-step" aria-labelledby="guide-step-${block.num}">
        <div class="guide-step__head">
          <span class="guide-step__badge">${esc(block.num)}</span>
          <span class="guide-step__icon" aria-hidden="true">${guideIcon(block.icon)}</span>
          <h2 class="guide-step__title" id="guide-step-${block.num}">${esc(block.title)}</h2>
        </div>
        <div class="guide-step__body">${paras}${bullets}${examples}</div>
      </section>`;
    }
    case "criteria": {
      const items = (block.items || [])
        .map(
          (item) => `<article class="guide-criteria-card glass-card">
        <span class="guide-criteria-card__num" aria-hidden="true">${esc(item.num)}</span>
        <span class="guide-criteria-card__icon" aria-hidden="true">${guideIcon(item.icon)}</span>
        <h3 class="guide-criteria-card__title">${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
      </article>`
        )
        .join("");
      return `<section class="guide-criteria" aria-labelledby="guide-criteria-title">
        <h2 class="blog-article__h2" id="guide-criteria-title">${esc(block.title)}</h2>
        ${block.intro ? `<p class="guide-criteria__intro">${esc(block.intro)}</p>` : ""}
        <div class="guide-criteria-grid">${items}</div>
      </section>`;
    }
    case "decision": {
      const items = (block.items || [])
        .map(
          (item) => `<article class="guide-decision-card glass-card">
        <span class="guide-decision-card__icon" aria-hidden="true">${guideIcon(item.icon)}</span>
        <h3 class="guide-decision-card__title">${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
      </article>`
        )
        .join("");
      return `<section class="guide-decision" aria-labelledby="guide-decision-title">
        <h2 class="blog-article__h2" id="guide-decision-title">${esc(block.title)}</h2>
        ${block.intro ? `<p>${esc(block.intro)}</p>` : ""}
        <div class="guide-decision-grid">${items}</div>
      </section>`;
    }
    case "callout": {
      const variant = block.variant === "la" ? "guide-callout--la" : "guide-callout--tip";
      const cta = block.cta
        ? `<a href="${esc(block.cta.href)}" class="btn btn-primary btn-glow" data-track="${esc(block.cta.event || "cta_busqueda")}">${esc(block.cta.label)}</a>`
        : "";
      return `<aside class="guide-callout glass-card ${variant}">
        <span class="guide-callout__icon" aria-hidden="true">${guideIcon(block.icon || "la")}</span>
        <div class="guide-callout__copy">
          <h2 class="guide-callout__title">${esc(block.title)}</h2>
          <p>${esc(block.text)}</p>
          ${cta}
        </div>
      </aside>`;
    }
    default:
      return renderBlogSection(block);
  }
}

function renderBlogSection(section) {
  switch (section.type) {
    case "h2":
      return `<h2 class="blog-article__h2">${esc(section.text)}</h2>`;
    case "h3":
      return `<h3 class="blog-article__h3">${esc(section.text)}</h3>`;
    case "p":
      return `<p>${esc(section.text)}</p>`;
    case "ul":
      return `<ul>${section.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
    case "note":
      return `<aside class="blog-article__note glass-card"><p>${esc(section.text)}</p></aside>`;
    default:
      return "";
  }
}

function buildBlogIndexContent(prefix) {
  const assets = assetPrefix();
  const cards = blogPosts
    .map((post) => {
      const href = `${prefix}blog/${post.slug}/`;
      const imgSrc = `${prefix}${(post.image || "/images/hero.jpg").replace(/^\//, "")}`;
      const date = new Date(`${post.datePublished}T12:00:00`).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const seriesBadge =
        post.series && post.seriesPart
          ? `<span class="blog-card__series">${esc(post.series)} · Parte ${post.seriesPart}</span>`
          : post.category
            ? `<span class="blog-card__category">${esc(post.category)}</span>`
            : "";
      const primaryTag = post.category || (post.tags && post.tags[0]) || "Artículo";

      return `<article class="blog-card">
        <a href="${href}" class="blog-card__media" tabindex="-1" aria-hidden="true">
          <img src="${imgSrc}" alt="${esc(post.imageAlt || post.h1)}" width="640" height="400" loading="lazy" decoding="async">
          <span class="blog-card__overlay" aria-hidden="true"></span>
          ${seriesBadge}
        </a>
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <span class="blog-card__category-pill">${esc(primaryTag)}</span>
            <span class="blog-card__meta-sep" aria-hidden="true">·</span>
            <time datetime="${post.datePublished}">${esc(date)}</time>
            <span class="blog-card__meta-sep" aria-hidden="true">·</span>
            <span>${post.readMinutes || 5} min</span>
          </div>
          <h2 class="blog-card__title"><a href="${href}">${esc(post.h1)}</a></h2>
          <p class="blog-card__excerpt">${esc(post.intro)}</p>
          <a href="${href}" class="blog-card__cta">Leer artículo <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    })
    .join("");

  const upcoming = (blogData.upcoming || [])
    .map((topic) => `<li>${esc(topic)}</li>`)
    .join("");

  return `<div class="blog-index-intro glass-card">
      <div class="blog-index-intro__icon" aria-hidden="true">
        <img src="${assets}logo-isotipo-3d.png" alt="" width="72" height="72">
      </div>
      <div class="blog-index-intro__copy">
        <p class="section-label">Editorial territorial</p>
        <p class="blog-index-intro__text">Análisis sobre mercado inmobiliario del sur de Chile, lectura de territorio y criterio para comprar el terreno correcto — sin hype ni promesas de rentabilidad.</p>
      </div>
    </div>
    <div class="blog-index-grid">${cards}</div>
    ${
      upcoming
        ? `<div class="seo-blog-soon glass-card blog-upcoming">
      <p class="section-label">Próximamente</p>
      <h2 class="blog-upcoming__title">Siguientes artículos</h2>
      <ul class="seo-topic-list">${upcoming}</ul>
    </div>`
        : ""
    }`;
}

function buildBlogArticleBody(post, prefix) {
  const sections = (post.sections || []).map(renderBlogSection).join("\n        ");
  const tags = (post.tags || [])
    .map((t) => `<span class="blog-tag">${esc(t)}</span>`)
    .join("");
  const related = (post.related || [])
    .map((r) => {
      const href = r.href.startsWith("#") ? `${prefix}${r.href}` : `${prefix}${r.href}`;
      return `<li><a href="${href}">${esc(r.label)}</a></li>`;
    })
    .join("");

  return `<article class="blog-article glass-card">
      <header class="blog-article__header">
        ${buildEeatByline(post, prefix)}
        <figure class="blog-article__figure">
          <img src="${prefix}${post.image.replace(/^\//, "")}" alt="${esc(post.imageAlt || post.h1)}" width="900" height="600" loading="lazy">
        </figure>
      </header>
      <div class="blog-article__content">
        <p class="blog-article__lead">${esc(post.intro)}</p>
        ${sections}
      </div>
      <footer class="blog-article__footer">
        <div class="blog-tags">${tags}</div>
        ${
          related
            ? `<nav class="blog-related" aria-label="Enlaces relacionados">
          <p class="blog-related__label">Relacionado</p>
          <ul>${related}</ul>
        </nav>`
            : ""
        }
      </footer>
    </article>`;
}

function buildCasesHubContent(prefix) {
  return caseStudies
    .map((cs) => {
      const href = `${prefix}casos-de-estudio/${cs.slug}/`;
      const imgSrc = `${prefix}${cs.image.replace(/^\//, "")}`;
      return `<article class="seo-card glass-card case-card">
        <a href="${href}" class="case-card__media" tabindex="-1" aria-hidden="true">
          <img src="${imgSrc}" alt="${esc(cs.imageAlt || cs.h1)}" width="640" height="400" loading="lazy">
        </a>
        <p class="case-card__territory">${esc(cs.territory)}</p>
        <h2><a href="${href}">${esc(cs.h1)}</a></h2>
        <p class="case-card__metric"><strong>${esc(cs.metric)}</strong></p>
        <p>${esc(cs.intro)}</p>
        <a href="${href}" class="btn btn-glass">Leer caso completo →</a>
      </article>`;
    })
    .join("");
}

function buildCaseStudyBody(caseStudy, prefix) {
  const sections = (caseStudy.sections || []).map(renderBlogSection).join("\n        ");
  const tags = (caseStudy.tags || [])
    .map((t) => `<span class="blog-tag">${esc(t)}</span>`)
    .join("");
  const related = (caseStudy.related || [])
    .map((r) => `<li><a href="${prefix}${r.href}">${esc(r.label)}</a></li>`)
    .join("");
  const faq = (caseStudy.faq || [])
    .map(
      (item) => `<details class="faq-item">
        <summary>${esc(item.q)}</summary>
        <div class="faq-answer"><p>${esc(item.a)}</p></div>
      </details>`
    )
    .join("");

  return `<article class="blog-article blog-article--case glass-card">
      <header class="blog-article__header">
        <p class="case-study__territory">${esc(caseStudy.territory)}</p>
        <p class="case-study__metric">${esc(caseStudy.metric)}</p>
        ${buildEeatByline(caseStudy, prefix)}
        <figure class="blog-article__figure">
          <img src="${prefix}${caseStudy.image.replace(/^\//, "")}" alt="${esc(caseStudy.imageAlt || caseStudy.h1)}" width="900" height="600" loading="lazy">
        </figure>
      </header>
      <div class="blog-article__content">
        <p class="blog-article__lead">${esc(caseStudy.intro)}</p>
        ${sections}
      </div>
      ${
        faq
          ? `<section class="seo-guide-faq" aria-labelledby="case-faq-title">
        <h2 id="case-faq-title" class="blog-article__h2">Preguntas frecuentes</h2>
        <div class="faq-list">${faq}</div>
      </section>`
          : ""
      }
      <footer class="blog-article__footer">
        <div class="blog-tags">${tags}</div>
        ${
          related
            ? `<nav class="blog-related" aria-label="Enlaces relacionados">
          <p class="blog-related__label">Relacionado</p>
          <ul>${related}</ul>
        </nav>`
            : ""
        }
      </footer>
    </article>`;
}

function buildCaseStudyPage(caseStudy) {
  const pagePath = `/casos-de-estudio/${caseStudy.slug}/`;
  const prefix = rootPrefix(pagePath);
  const assets = assetPrefix();
  const page = {
    path: pagePath,
    title: caseStudy.title,
    description: caseStudy.description,
    breadcrumb: caseStudy.h1,
    h1: caseStudy.h1,
    intro: caseStudy.intro,
    image: caseStudy.image,
    type: "case-study",
  };
  const schemas = buildSchemas(page);
  schemas.push(caseStudySchema(caseStudy, pagePath));
  if (caseStudy.faq?.length) schemas.push(faqPageSchema(caseStudy.faq));
  const ctaHref = prefix + "#contacto-form";

  return `<!DOCTYPE html>
<html lang="es">
<head>
${buildHead(page, prefix, assets, { ogType: "article", ogImage: site.url + caseStudy.image })}
  ${schemas.map((s) => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body class="site-v2 seo-page seo-page--case-study">
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
    <section class="seo-hero seo-hero--article">
      <div class="container" data-reveal>
        <nav class="seo-breadcrumb" aria-label="Breadcrumb">
          <a href="${prefix}">Inicio</a>
          <span aria-hidden="true"> / </span><a href="${prefix}casos-de-estudio/">Casos</a>
          <span aria-hidden="true"> / </span><span>${esc(caseStudy.territory)}</span>
        </nav>
        <p class="section-label">Caso de estudio</p>
        <h1>${esc(caseStudy.h1)}</h1>
      </div>
    </section>
    <section class="seo-body">
      <div class="container" data-reveal>
        ${buildCaseStudyBody(caseStudy, prefix)}
        ${buildInternalLinks(page, prefix)}
      </div>
    </section>
    <section class="cta-band">
      <div class="container">
        <h2>¿Evaluando un terreno en el sur de Chile?</h2>
        <p>Reunión estratégica para ordenar zona, criterio y próximos pasos con lectura territorial.</p>
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

function buildBlogPostPage(post) {
  const pagePath = `/blog/${post.slug}/`;
  const prefix = rootPrefix(pagePath);
  const assets = assetPrefix();
  const page = {
    path: pagePath,
    title: post.title,
    description: post.description,
    breadcrumb: post.h1,
    h1: post.h1,
    intro: post.intro,
    image: post.image,
  };
  const schemas = buildSchemas({ ...page, type: "blog-post" });
  schemas.push(blogPostSchema(post, pagePath));
  const ctaHref = prefix + "#contacto-form";

  return `<!DOCTYPE html>
<html lang="es">
<head>
${buildHead(page, prefix, assets, { ogType: "article", ogImage: site.url + post.image })}
  <script type="application/ld+json">${JSON.stringify(schemas[0])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[1])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[2])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[3])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[4])}</script>
</head>
<body class="site-v2 seo-page seo-page--blog-post">
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
    <section class="seo-hero seo-hero--article">
      <div class="container" data-reveal>
        <nav class="seo-breadcrumb" aria-label="Breadcrumb">
          <a href="${prefix}">Inicio</a>
          <span aria-hidden="true"> / </span><a href="${prefix}blog/">Blog</a>
          <span aria-hidden="true"> / </span><span>${esc(post.h1)}</span>
        </nav>
        <p class="section-label">Artículo</p>
        <h1>${esc(post.h1)}</h1>
      </div>
    </section>
    <section class="seo-body">
      <div class="container" data-reveal>
        ${buildBlogArticleBody(post, prefix)}
        ${buildInternalLinks({ path: pagePath, type: "blog-post" }, prefix)}
      </div>
    </section>
    <section class="cta-band">
      <div class="container">
        <h2>¿Evaluando un terreno en el sur de Chile?</h2>
        <p>Reunión estratégica para ordenar zona, criterio y próximos pasos con lectura territorial.</p>
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

function campaignCtaMarkup(track, variant = "float") {
  const waLabel = variant === "hero" ? "Consultar por WhatsApp" : "WhatsApp";
  const calLabel = "Agendar reunión";
  const sizeClass = variant === "hero" ? " campaign-cta--lg" : "";
  const waIcon = `<svg class="campaign-cta__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`;
  const calIcon = `<svg class="campaign-cta__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>`;
  return `<a href="#" class="campaign-cta campaign-cta--wa${sizeClass}" data-campaign-wa data-track="${esc(track)}" target="_blank" rel="noopener noreferrer">${waIcon}<span class="campaign-cta__label">${waLabel}</span></a>
          <a href="#" class="campaign-cta campaign-cta--cal${sizeClass}" data-campaign-calendar data-track="cta_diagnostico" target="_blank" rel="noopener noreferrer">${calIcon}<span class="campaign-cta__label">${calLabel}</span></a>`;
}

function campaignFooterScripts(prefix, campaign) {
  const track = campaign.serviceEvent || "cta_busqueda";
  return `  <div id="la-chat-widget" aria-label="Contacto"></div>
  <aside class="campaign-float-cta" aria-label="Acciones de campaña" hidden>
    <div class="campaign-float-cta__inner">
      ${campaignCtaMarkup(track, "float")}
    </div>
  </aside>
  <script>document.getElementById("year").textContent = new Date().getFullYear();</script>
  <script src="${prefix}landing-ui.js" defer></script>
  <script src="${prefix}calendar-config.js" defer></script>
  <script src="${prefix}campaign-landing.js" defer></script>
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
  </script>`;
}

function buildCampaignPage(campaign) {
  const pagePath = `/campanas/${campaign.slug}/`;
  const prefix = rootPrefix(pagePath);
  const assets = assetPrefix();
  const page = {
    path: pagePath,
    title: campaign.title,
    description: campaign.description,
    breadcrumb: "Oferta",
    h1: campaign.h1,
    intro: campaign.heroLead,
    image: campaign.image,
    type: "campaign",
  };
  const schemas = buildSchemas(page);
  schemas.push(websiteSchema());
  if (campaign.faq?.length) schemas.push(faqPageSchema(campaign.faq));
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Offer",
    name: "Búsqueda personalizada de terrenos — promoción 30%",
    description: campaign.description,
    price: campaign.pricePromo,
    priceCurrency: "CLF",
    validThrough: campaign.deadline,
    seller: { "@type": "Organization", name: site.name, url: site.url },
    url: site.url + pagePath,
  });

  const includes = (campaign.includes || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join("");
  const steps = (campaign.steps || [])
    .map(
      (step) => `<article class="campaign-step glass-card">
        <span class="campaign-step__num">${esc(step.num)}</span>
        <h3 class="campaign-step__title">${esc(step.title)}</h3>
        <p>${esc(step.text)}</p>
      </article>`
    )
    .join("");
  const faq = (campaign.faq || [])
    .map(
      (item) => `<details class="faq-item">
        <summary>${esc(item.q)}</summary>
        <div class="faq-answer"><p>${esc(item.a)}</p></div>
      </details>`
    )
    .join("");
  const track = campaign.serviceEvent || "cta_busqueda";
  const imgSrc = `${prefix}${(campaign.image || site.defaultOgImage).replace(/^\//, "")}`;
  const imgW = campaign.imageWidth || 1600;
  const imgH = campaign.imageHeight || 900;
  const imgPos = campaign.imagePosition || "center center";
  const commissionBlock = campaign.commissionCredit
    ? `<div class="campaign-pricing__commission">
            <span class="campaign-pricing__bonus-tag">Si compras</span>
            <p>${esc(campaign.commissionCredit)}</p>
          </div>`
    : "";
  const sidePhoto = campaign.sideImage
    ? `<figure class="campaign-side-photo glass-card">
            <img src="${prefix}${campaign.sideImage.replace(/^\//, "")}" alt="${esc(campaign.sideImageAlt || "")}" width="720" height="480" loading="lazy" decoding="async">
            ${campaign.sideImageCaption ? `<figcaption>${esc(campaign.sideImageCaption)}</figcaption>` : ""}
          </figure>`
    : "";

  return `<!DOCTYPE html>
<html lang="es" data-wa-intro="${esc(campaign.whatsappIntro)}">
<head>
${buildHead(page, prefix, assets, { ogImage: site.url + campaign.image, ogType: "website" })}
  <link rel="stylesheet" href="${prefix}styles-campaign.css">
  ${schemas.map((s) => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body class="site-v2 seo-page seo-page--campaign">
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
    <section class="campaign-hero">
      <div class="campaign-hero__bg" aria-hidden="true">
        <img src="${imgSrc}" alt="" width="${imgW}" height="${imgH}" loading="eager" decoding="async" style="object-position: ${esc(imgPos)}">
        <div class="campaign-hero__overlay"></div>
      </div>
      <div class="container campaign-hero__inner" data-reveal>
        <p class="campaign-badge">Oferta hasta el ${esc(campaign.deadlineLabel)}</p>
        <p class="section-label">Búsqueda personalizada</p>
        <h1>${esc(campaign.h1)}<br><span class="text-gradient">con 30% de descuento</span></h1>
        <p class="campaign-hero__lead">${esc(campaign.heroLead)}</p>

        <div class="campaign-pricing glass-card">
          <div class="campaign-pricing__main">
            <span class="campaign-pricing__label">Precio promocional</span>
            <strong class="campaign-pricing__price">${esc(campaign.pricePromo)}</strong>
            <span class="campaign-pricing__was">Antes ${esc(campaign.priceRegular)}</span>
          </div>
          <div class="campaign-pricing__bonus">
            <span class="campaign-pricing__bonus-tag">Incluido</span>
            <p><strong>Diagnóstico estratégico gratis</strong> <span class="campaign-pricing__muted">(valor ${esc(campaign.priceDiagnostic)})</span></p>
          </div>
          ${commissionBlock}
        </div>

        <div class="campaign-hero__actions campaign-hero__actions--cta">
          ${campaignCtaMarkup(track, "hero")}
        </div>
        <p class="campaign-hero__note">Desde Santiago, el norte o el sur de Chile · Reunión online o presencial en Puerto Varas</p>
      </div>
    </section>

    <section class="campaign-body">
      <div class="container" data-reveal>
        <div class="campaign-grid">
          <div class="campaign-grid__left">
          <section class="campaign-panel glass-card" aria-labelledby="campaign-includes-title">
            <p class="section-label">Qué incluye</p>
            <h2 class="campaign-panel__title" id="campaign-includes-title">Todo el proceso, con criterio territorial</h2>
            <ul class="campaign-includes">${includes}</ul>
            <p class="campaign-panel__foot">No somos corredora: no vendemos terrenos. Te acompañamos a comprar el correcto.</p>
          </section>
          ${sidePhoto}
          </div>

          <section class="campaign-steps" aria-labelledby="campaign-steps-title">
            <h2 class="campaign-panel__title" id="campaign-steps-title">Cómo funciona</h2>
            <div class="campaign-steps__grid">${steps}</div>
          </section>
        </div>

        <section class="campaign-ally glass-card">
          <p class="section-label">De tu lado</p>
          <h2>Enamorarse del terreno está bien</h2>
          <p>${esc(campaign.allyText || "Lo que ordena la decisión es si cumple tu objetivo, si el precio calza con el mercado local y si el terreno es viable. Eso es lo que hacemos cada semana en la cuenca del Lago Llanquihue y Malalcahuello.")}</p>
          <a href="${prefix}guias/" class="btn btn-glass">Ver guía para comprar terreno →</a>
        </section>

        ${
          faq
            ? `<section class="campaign-faq seo-guide-faq" aria-labelledby="campaign-faq-title">
          <h2 id="campaign-faq-title" class="blog-article__h2">Preguntas frecuentes</h2>
          <div class="faq-list">${faq}</div>
        </section>`
            : ""
        }

        <p class="campaign-legal">${esc(campaign.legal)}</p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <img src="${assets}logo-isotipo-3d.png" alt="Land Advisors" class="footer-isotipo" width="72" height="72">
      <p class="footer-address">${esc(site.address.street)}, ${esc(site.address.locality)} · ${esc(site.address.region)}</p>
      <p class="footer-copy">© <span id="year"></span> Land Advisors Chile · ${esc(site.tagline)} · Sur de Chile</p>
    </div>
  </footer>

${campaignFooterScripts(prefix, campaign)}
</body>
</html>`;
}

function navLinks(prefix) {
  return `        <nav id="main-nav" class="nav" aria-label="Principal">
          <div class="nav-links">
            <a href="${prefix}servicios/">Servicios</a>
            <a href="${prefix}territorios/">Territorios</a>
            <a href="${prefix}casos-de-estudio/">Casos</a>
            <a href="${prefix}blog/">Blog</a>
            <a href="${prefix}guias/">Guías</a>
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
  const hubGuide = page.path === "/guias/" ? hubGuideForPage(page) : null;
  const pageView = hubGuide
    ? {
        ...page,
        title: hubGuide.title,
        description: hubGuide.description,
        h1: hubGuide.h1,
        intro: hubGuide.intro,
        image: hubGuide.image,
      }
    : page;
  const schemas = buildSchemas(pageView);
  if (hubGuide) {
    schemas.push(websiteSchema());
    schemas.push(articleSchema(hubGuide, page.path));
    if (hubGuide.faq?.length) schemas.push(faqPageSchema(hubGuide.faq));
  }
  const cta = page.cta || { label: "Agendar reunión estratégica", event: "cta_contacto" };
  const ctaHref = prefix + (hubGuide ? "servicios/busqueda-personalizada/" : "#contacto-form");
  const ctaEvent = hubGuide ? "cta_busqueda" : cta.event;
  const ctaLabel = hubGuide ? "Solicitar búsqueda personalizada" : cta.label;

  let extraContent = "";
  if (page.path === "/servicios/") extraContent = buildServicesCatalog(prefix);
  else if (page.path === "/territorios/") extraContent = `<div class="seo-card-grid">${territoryLinks(prefix)}</div>`;
  else if (page.path === "/casos-de-estudio/") {
    extraContent = `<div class="seo-card-grid">${buildCasesHubContent(prefix)}</div>`;
  } else if (page.path === "/blog/") {
    extraContent = buildBlogIndexContent(prefix);
  } else if (page.path === "/guias/") {
    extraContent = buildGuidesHubContent(page, prefix);
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
${buildHead(pageView, prefix, assets, hubGuide ? { ogImage: site.url + hubGuide.image } : {})}
  <script type="application/ld+json">${JSON.stringify(schemas[0])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[1])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[2])}</script>
  <script type="application/ld+json">${JSON.stringify(schemas[3])}</script>
  ${page.service ? `<script type="application/ld+json">${JSON.stringify(schemas[4])}</script>` : ""}
  ${schemas.slice(page.service ? 5 : 4).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n  ")}
</head>
<body class="site-v2 seo-page${page.path === "/servicios/" ? " seo-page--servicios" : page.path === "/blog/" ? " seo-page--blog" : hubGuide ? " seo-page--guide" : ""}">
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
    <section class="seo-hero${hubGuide ? " seo-hero--article" : ""}">
      <div class="container" data-reveal>
        <nav class="seo-breadcrumb" aria-label="Breadcrumb">
          <a href="${prefix}">Inicio</a>
          ${page.path !== "/" ? `<span aria-hidden="true"> / </span><span>${esc(hubGuide ? "Guías" : page.breadcrumb)}</span>` : ""}
        </nav>
        <p class="section-label">${esc(hubGuide ? "Guía" : page.type === "service" ? "Servicio" : page.type === "territory" ? "Territorio" : page.breadcrumb)}</p>
        <h1>${esc(pageView.h1)}</h1>
        <p class="section-intro">${esc(pageView.intro)}</p>
        ${serviceBlock}
        ${
          hubGuide
            ? ""
            : `<div class="seo-hero-actions">
          <a href="${ctaHref}" class="btn btn-primary btn-glow" data-track="${cta.event}">${esc(cta.label)}</a>
          <a href="${site.whatsapp}" class="btn btn-glass" target="_blank" rel="noopener noreferrer" data-track="cta_whatsapp">WhatsApp</a>
        </div>`
        }
      </div>
    </section>
    <section class="seo-body">
      <div class="container" data-reveal>
        ${extraContent}
        ${hubGuide ? "" : buildInternalLinks(page, prefix)}
      </div>
    </section>
    <section class="cta-band">
      <div class="container">
        <h2>${hubGuide ? "¿Evaluando terreno en el sur de Chile?" : "Inteligencia territorial antes de invertir"}</h2>
        <p>${hubGuide ? "Reunión estratégica para ordenar zona, criterio y próximos pasos con lectura territorial." : "Reunión estratégica para ordenar tu decisión con criterio de mercado y territorio."}</p>
        <a href="${ctaHref}" class="btn btn-primary btn-glow" data-track="${hubGuide ? ctaEvent : "cta_contacto"}">${esc(hubGuide ? ctaLabel : "Agendar reunión estratégica")}</a>
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
  const allPages = [
    ...pages,
    ...blogPosts.map((post) => ({
      path: `/blog/${post.slug}/`,
      type: "blog-post",
    })),
    ...caseStudies.map((cs) => ({
      path: `/casos-de-estudio/${cs.slug}/`,
      type: "case-study",
    })),
    ...campaigns.map((campaign) => ({
      path: `/campanas/${campaign.slug}/`,
      type: "campaign",
    })),
  ];
  const urls = allPages
    .map((p) => {
      const loc = site.url + (p.path === "/" ? "/" : p.path);
      const priority =
        p.path === "/"
          ? "1.0"
          : p.type === "guide-hub"
            ? "0.85"
            : p.type === "campaign"
              ? "0.85"
            : p.type === "guide"
              ? "0.85"
              : p.type === "service" || p.type === "territory"
              ? "0.8"
              : p.type === "blog-post"
                ? "0.75"
                : p.type === "case-study"
                  ? "0.8"
                  : "0.7";
      const changefreq = p.type === "blog" || p.type === "blog-post" ? "weekly" : "monthly";
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

for (const post of blogPosts) {
  const file = `blog/${post.slug}/index.html`;
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buildBlogPostPage(post), "utf8");
  console.log("wrote", file);
}

for (const entry of retiredPosts) {
  const file = `blog/${entry.slug}/index.html`;
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buildRetiredPostRedirect(entry), "utf8");
  console.log("wrote redirect", file);
}

for (const caseStudy of caseStudies) {
  const file = `casos-de-estudio/${caseStudy.slug}/index.html`;
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buildCaseStudyPage(caseStudy), "utf8");
  console.log("wrote", file);
}

for (const guide of guides) {
  const file = `guias/${guide.slug}/index.html`;
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buildGuidePage(guide), "utf8");
  console.log("wrote", file);
}

for (const campaign of campaigns) {
  const file = `campanas/${campaign.slug}/index.html`;
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buildCampaignPage(campaign), "utf8");
  console.log("wrote", file);
}

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), buildSitemap(), "utf8");
console.log("wrote sitemap.xml");
