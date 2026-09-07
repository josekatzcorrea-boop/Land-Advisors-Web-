#!/usr/bin/env node
/**
 * Genera landing/i18n/en/seo-pages.json desde landing/seo/en/*.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEO = path.join(__dirname, "..", "seo");
const EN_DIR = path.join(SEO, "en");
const OUT = path.join(__dirname, "..", "i18n", "en", "seo-pages.json");

function readEn(name, fallback = null) {
  const p = path.join(EN_DIR, name);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function sectionsToBlocks(sections, offset = 0) {
  return (sections || []).map((s, i) => {
    const block = { idx: offset + i, type: s.type };
    if (s.type === "ul") block.items = s.items;
    else if (s.text) block.en = s.text;
    return block;
  });
}

function guideBlocksToEn(blocks) {
  return (blocks || []).map((b, idx) => {
    const out = { idx, type: b.type };
    if (b.label) out.label = b.label;
    if (b.title) out.title = b.title;
    if (b.intro) out.intro = b.intro;
    if (b.text) out.text = b.text;
    if (b.paragraphs) out.paragraphs = b.paragraphs;
    if (b.bullets) out.bullets = b.bullets;
    if (b.items) out.items = b.items;
    if (b.examples) out.examples = b.examples;
    if (b.groups) out.groups = b.groups;
    if (b.cta) out.cta = b.cta;
    return out;
  });
}

function pageMeta(item, label = "Article") {
  return {
    title: item.title,
    description: item.description,
    h1: item.h1 || item.title,
    intro: item.intro,
    breadcrumb: item.h1 || item.title,
    label,
  };
}

function faqBlocks(faq, startIdx = 900) {
  return (faq || []).map((item, i) => ({
    idx: startIdx + i,
    type: "faq",
    q: item.q,
    en: item.a,
  }));
}

function buildCampaignPage(c) {
  const pathKey = `/campanas/${c.slug}/`;
  const sel = {
    ".campaign-intent-badge": { en: "Territorial consultancy · Not an estate agency" },
    ".campaign-hero-qa li:nth-child(1)": {
      en: `<strong>The challenge:</strong> ${c.heroProblem || ""}`,
      html: true,
    },
    ".campaign-hero-qa li:nth-child(2)": {
      en: `<strong>Why us:</strong> ${c.heroWhyUs || ""}`,
      html: true,
    },
    ".campaign-hero-qa li:nth-child(3)": {
      en: `<strong>What you gain:</strong> ${c.heroGain || ""}`,
      html: true,
    },
    ".campaign-panel .section-label": { en: "Benefit" },
    "#campaign-includes-title": { en: c.includesTitle || "What you get" },
    ".campaign-panel__foot": {
      en: "We are not an estate agency: we do not sell land. We help you decide with criteria.",
    },
    "#campaign-steps-title": { en: "How it works" },
    ".campaign-ally .section-label": { en: "On your side" },
    ".campaign-ally h2": {
      en:
        c.allyTitle ||
        "Photos open the visit. Territory, regulation and numbers close the decision",
    },
    "#campaign-faq-title": { en: "Frequently asked questions" },
    ".campaign-final-cta h2": { en: "Ready to decide with criteria?" },
    ".campaign-final-cta p": {
      en: "Book a strategy session or message us on WhatsApp — no purchase obligation.",
    },
  };

  (c.includes || []).forEach((text, i) => {
    sel[`.campaign-includes li:nth-child(${i + 1})`] = { en: text };
  });
  (c.steps || []).forEach((step, i) => {
    const n = i + 1;
    sel[`.campaign-step:nth-child(${n}) .campaign-step__title`] = { en: step.title };
    sel[`.campaign-step:nth-child(${n}) p`] = { en: step.text };
  });
  (c.faq || []).forEach((item, i) => {
    const n = i + 1;
    sel[`.campaign-faq .faq-item:nth-child(${n}) summary`] = { en: item.q };
    sel[`.campaign-faq .faq-item:nth-child(${n}) .faq-answer p`] = { en: item.a };
  });

  if (c.proof) {
    sel[".campaign-proof .section-label"] = { en: "Evidence" };
    sel[".campaign-proof__title"] = { en: c.proof.title || "Real decisions with criteria" };
    (c.proof.stats || []).forEach((s, i) => {
      sel[`.campaign-stat:nth-child(${i + 1}) .campaign-stat__label`] = { en: s.label };
    });
    (c.proof.quotes || []).forEach((q, i) => {
      sel[`.campaign-quote:nth-child(${i + 1}) p`] = { en: q.text };
      sel[`.campaign-quote:nth-child(${i + 1}) cite`] = { en: q.source };
    });
  }

  if (c.leadMagnet) {
    sel[".campaign-lead-magnet h2"] = { en: c.leadMagnet.title };
    sel[".campaign-lead-magnet p"] = { en: c.leadMagnet.description };
    sel[".campaign-lead-magnet a"] = { en: c.leadMagnet.cta };
  }

  if (c.template !== "intent") {
    sel[".campaign-badge"] = { en: `Offer until ${c.deadlineLabel || ""}` };
    sel[".campaign-pricing__label"] = { en: c.promoFlow === "diagnostico-first" ? "Step 1 · no cost" : "Promotional price" };
    sel[".campaign-pricing__bonus-tag"] = { en: c.promoFlow === "diagnostico-first" ? "Step 2 · optional" : "Included" };
  }

  return {
    pathKey,
    en: pageMeta(c, "Offer"),
    _selectors: sel,
  };
}

function buildServicesHub(catalog) {
  const sel = {
    ".services-catalog-price-note": { en: catalog.priceNote },
    ".services-catalog-legal": { en: catalog.legal },
    ".services-life-gallery__label": { en: catalog.gallery?.eyebrow },
    ".services-life-gallery__phrase": { en: catalog.gallery?.phrase },
    ".promo-banner__badge": { en: catalog.promo?.badge },
    ".promo-banner__title": { en: catalog.promo?.title },
    ".promo-banner__text": { en: catalog.promo?.text },
    ".promo-banner__cta": { en: catalog.promo?.cta },
  };
  (catalog.services || []).forEach((svc, i) => {
    const n = i + 1;
    sel[`.services-catalog-item:nth-child(${n}) h2`] = { en: svc.title };
    sel[`.services-catalog-item:nth-child(${n}) .services-catalog-price`] = { en: svc.price };
    sel[`.services-catalog-item:nth-child(${n}) .service-card-link`] = { en: svc.cta?.label };
    if (svc.objective) {
      sel[`.services-catalog-item:nth-child(${n}) .service-detail-objective`] = { en: svc.objective };
    }
    (svc.deliverables || []).forEach((d, j) => {
      sel[`.services-catalog-item:nth-child(${n}) .service-detail-list li:nth-child(${j + 1})`] = { en: d };
    });
    (svc.notes || []).forEach((note, j) => {
      sel[`.services-catalog-item:nth-child(${n}) .service-detail-note:nth-of-type(${j + 1})`] = { en: note };
    });
  });
  (catalog.gallery?.images || []).forEach((img, i) => {
    sel[`.services-life-gallery__item:nth-child(${i + 1}) img`] = { en: img.alt, attr: "alt" };
  });
  return sel;
}

function buildServiceDetail(svc, catalog) {
  const sel = {
    ".seo-service-meta p:last-child": { en: svc.description || svc.objective || "" },
    ".seo-service-meta__label": { en: "Investment" },
    ".service-detail-objective": { en: svc.objective || "" },
    ".seo-service-body h2": { en: svc.bodyTitle || "What is included" },
  };
  (svc.deliverables || []).forEach((d, i) => {
    sel[`.service-detail-list li:nth-child(${i + 1})`] = { en: d };
  });
  (svc.notes || []).forEach((note, i) => {
    sel[`.service-detail-note:nth-of-type(${i + 1})`] = { en: note };
  });
  return sel;
}

function buildBlogHub(postsEn, upcoming) {
  const sel = {
    ".blog-index-intro .section-label": { en: "Territorial editorial" },
    ".blog-index-intro__text": {
      en: "Analysis on the southern Chile property market, territorial reading and criteria for buying the right land — without hype or return promises.",
    },
    ".blog-upcoming__title": { en: "Coming next" },
    ".blog-card__cta": { en: "Read article →" },
  };
  (postsEn.posts || []).forEach((post, i) => {
    const n = i + 1;
    sel[`.blog-card:nth-child(${n}) .blog-card__title a`] = { en: post.h1 };
    sel[`.blog-card:nth-child(${n}) .blog-card__excerpt`] = { en: post.intro };
    sel[`.blog-card:nth-child(${n}) .blog-card__category-pill`] = { en: post.category || "Article" };
    if (post.series) {
      sel[`.blog-card:nth-child(${n}) .blog-card__series`] = {
        en: `${post.series} · Part ${post.seriesPart || 1}`,
      };
    }
  });
  (upcoming || []).forEach((topic, i) => {
    sel[`.seo-topic-list li:nth-child(${i + 1})`] = { en: topic };
  });
  return sel;
}

function buildCasesHub(cases) {
  const sel = { ".case-card .btn": { en: "Read full case →" } };
  (cases || []).forEach((cs, i) => {
    const n = i + 1;
    sel[`.case-card:nth-child(${n}) h2 a`] = { en: cs.h1 };
    sel[`.case-card:nth-child(${n}) .case-card__territory`] = { en: cs.territory };
    sel[`.case-card:nth-child(${n}) .case-card__metric strong`] = { en: cs.metric };
    sel[`.case-card:nth-child(${n}) p:not(.case-card__metric):not(.case-card__territory)`] = { en: cs.intro };
  });
  return sel;
}

function buildTerritoryPage(slug, content) {
  const blocks = sectionsToBlocks(content.sections);
  if (content.definition) {
    blocks.unshift({ idx: "def", type: "p", en: content.definition, prefix: "Definition: " });
  }
  const sel = {
    ".seo-guide-faq .blog-article__h2": { en: "Frequently asked questions" },
    ".blog-related__label": { en: "Related" },
  };
  (content.faq || []).forEach((item, i) => {
    sel[`.faq-item:nth-child(${i + 1}) summary`] = { en: item.q };
    sel[`.faq-item:nth-child(${i + 1}) .faq-answer p`] = { en: item.a };
  });
  (content.related || []).forEach((r, i) => {
    sel[`.blog-related li:nth-child(${i + 1}) a`] = { en: r.label };
  });
  return { blocks, _selectors: sel };
}

const pagesOut = { pages: {} };

const hubs = readEn("pages-hubs.json", []);
for (const hub of hubs) {
  if (hub.path === "/") continue;
  pagesOut.pages[hub.path] = {
    en: {
      title: hub.title,
      description: hub.description,
      h1: hub.h1,
      intro: hub.intro,
      breadcrumb: hub.breadcrumb,
      label: hub.breadcrumb,
    },
  };
}

const catalog = readEn("services-catalog.json", { services: [] });
if (pagesOut.pages["/servicios/"]) {
  pagesOut.pages["/servicios/"]._selectors = buildServicesHub(catalog);
}

for (const svc of catalog.services || []) {
  const pathKey = `/servicios/${svc.slug}/`;
  const hub = hubs.find((h) => h.path === pathKey);
  pagesOut.pages[pathKey] = {
    en: {
      title: hub?.title || `${svc.title} | Land Advisors`,
      description: hub?.description || svc.objective || svc.notes?.[0] || "",
      h1: svc.title,
      intro: hub?.intro || svc.notes?.[0] || "",
      breadcrumb: svc.title,
      label: "Service",
    },
    _selectors: buildServiceDetail(svc, catalog),
  };
}

const postsEn = readEn("posts.json", { posts: [], upcoming: [] });
if (pagesOut.pages["/blog/"]) {
  pagesOut.pages["/blog/"]._selectors = buildBlogHub(postsEn, postsEn.upcoming);
}
for (const post of postsEn.posts || []) {
  const pathKey = `/blog/${post.slug}/`;
  const sel = {
    ".blog-article__lead": { en: post.intro },
    ".seo-guide-faq .blog-article__h2": { en: "Frequently asked questions" },
    ".blog-related__label": { en: "Related" },
  };
  (post.faq || []).forEach((item, i) => {
    sel[`.faq-item:nth-child(${i + 1}) summary`] = { en: item.q };
    sel[`.faq-item:nth-child(${i + 1}) .faq-answer p`] = { en: item.a };
  });
  (post.related || []).forEach((r, i) => {
    sel[`.blog-related li:nth-child(${i + 1}) a`] = { en: r.label };
  });
  (post.tags || []).forEach((t, i) => {
    sel[`.blog-tag:nth-child(${i + 1})`] = { en: t };
  });
  pagesOut.pages[pathKey] = {
    en: pageMeta(post, "Article"),
    blocks: sectionsToBlocks(post.sections),
    _selectors: sel,
  };
}

const casesEn = readEn("cases.json", { cases: [] });
if (pagesOut.pages["/casos-de-estudio/"]) {
  pagesOut.pages["/casos-de-estudio/"]._selectors = buildCasesHub(casesEn.cases);
}
for (const cs of casesEn.cases || []) {
  const pathKey = `/casos-de-estudio/${cs.slug}/`;
  const sel = {
    ".blog-article__lead": { en: cs.intro },
    ".case-study__territory": { en: cs.territory },
    ".case-study__metric": { en: cs.metric },
    ".seo-guide-faq .blog-article__h2": { en: "Frequently asked questions" },
    ".blog-related__label": { en: "Related" },
  };
  (cs.faq || []).forEach((item, i) => {
    sel[`.faq-item:nth-child(${i + 1}) summary`] = { en: item.q };
    sel[`.faq-item:nth-child(${i + 1}) .faq-answer p`] = { en: item.a };
  });
  (cs.tags || []).forEach((t, i) => {
    sel[`.blog-tag:nth-child(${i + 1})`] = { en: t };
  });
  pagesOut.pages[pathKey] = {
    en: pageMeta(cs, "Case study"),
    blocks: sectionsToBlocks(cs.sections),
    _selectors: sel,
  };
}

const guidesEn = readEn("guides.json", { guides: [] });
for (const guide of guidesEn.guides || []) {
  const pathKey = `/guias/${guide.slug}/`;
  const sel = {
    ".blog-article__lead": { en: guide.intro },
    ".guide-callout--footer .guide-callout__title": { en: "Want us to do this with you?" },
    ".guide-callout--footer p": {
      en: "At Land Advisors this process is our daily work: territory, regulation, market and price with local criteria. We do not sell land — we help you buy the right one.",
    },
    ".guide-callout--footer a": { en: guide.cta?.label || "Request personalised search" },
    ".seo-guide-faq .blog-article__h2": { en: "Frequently asked questions" },
    ".blog-related__label": { en: "Related" },
  };
  (guide.faq || []).forEach((item, i) => {
    sel[`.faq-item:nth-child(${i + 1}) summary`] = { en: item.q };
    sel[`.faq-item:nth-child(${i + 1}) .faq-answer p`] = { en: item.a };
  });
  if (pagesOut.pages["/guias/"]) {
    pagesOut.pages["/guias/"].blocks = guideBlocksToEn(guide.blocks);
    pagesOut.pages["/guias/"]._selectors = {
      ...(pagesOut.pages["/guias/"]._selectors || {}),
      ...sel,
    };
  }
  pagesOut.pages[pathKey] = {
    en: pageMeta(guide, "Guide"),
    blocks: guideBlocksToEn(guide.blocks),
    _selectors: sel,
  };
}

const territoriesEn = readEn("territories-content.json", {});
for (const [slug, content] of Object.entries(territoriesEn)) {
  const pathKey = `/territorios/${slug}/`;
  const hub = hubs.find((h) => h.path === pathKey);
  const { blocks, _selectors } = buildTerritoryPage(slug, content);
  pagesOut.pages[pathKey] = {
    en: {
      title: hub?.title || content.title || slug,
      description: hub?.description || content.description || "",
      h1: hub?.h1 || content.h1 || slug,
      intro: hub?.intro || content.intro || "",
      breadcrumb: hub?.breadcrumb || content.h1 || slug,
      label: "Territory",
    },
    blocks,
    _selectors,
  };
}

const campaignsEn = readEn("campaigns.json", { campaigns: [] });
for (const c of campaignsEn.campaigns || []) {
  const { pathKey, en, _selectors } = buildCampaignPage(c);
  pagesOut.pages[pathKey] = { en, _selectors };
}

const intelEn = readEn("inteligencia-territorial.json", null);
if (intelEn && pagesOut.pages["/inteligencia-territorial/"]) {
  const intelSel = pagesOut.pages["/inteligencia-territorial/"]._selectors || {};
  intelSel[".blog-article__lead"] = { en: intelEn.intro };
  intelSel["#intel-faq-title"] = { en: "Frequently asked questions" };
  (intelEn.clusters || []).forEach((cluster, i) => {
    const n = i + 1;
    intelSel[`.intel-cluster:nth-child(${n}) .section-label`] = { en: cluster.label };
    if (cluster.description) {
      intelSel[`.intel-cluster:nth-child(${n}) .intel-cluster__desc`] = { en: cluster.description };
    }
    (cluster.links || []).forEach((link, j) => {
      intelSel[`.intel-cluster:nth-child(${n}) li:nth-child(${j + 1}) a`] = { en: link.label };
      if (link.meta) {
        intelSel[`.intel-cluster:nth-child(${n}) li:nth-child(${j + 1}) .intel-cluster__meta`] = {
          en: link.meta,
        };
      }
    });
  });
  (intelEn.faq || []).forEach((item, i) => {
    intelSel[`.intel-faq .faq-item:nth-child(${i + 1}) summary`] = { en: item.q };
    intelSel[`.intel-faq .faq-item:nth-child(${i + 1}) .faq-answer p`] = { en: item.a };
  });
  pagesOut.pages["/inteligencia-territorial/"]._selectors = intelSel;
}

const ilaEn = readEn("ila-index.json", null);
if (ilaEn && pagesOut.pages["/indice-territorial/"]) {
  const ilaSel = pagesOut.pages["/indice-territorial/"]._selectors || {};
  if (ilaEn.disclaimer) ilaSel[".ila-hub-note"] = { en: ilaEn.disclaimer };
  if (ilaEn.methodTitle) ilaSel[".ila-method__title"] = { en: ilaEn.methodTitle };
  if (ilaEn.methodIntro) ilaSel[".ila-method__intro"] = { en: ilaEn.methodIntro };
  (ilaEn.dimensions || []).forEach((d, i) => {
    ilaSel[`.ila-dim-def:nth-child(${i + 1})`] = { en: d.description || d.label };
  });
  pagesOut.pages["/indice-territorial/"]._selectors = ilaSel;
}

const pagesEs = JSON.parse(fs.readFileSync(path.join(SEO, "pages.json"), "utf8"));
const territoryPages = pagesEs.filter((p) => p.type === "territory");
if (pagesOut.pages["/territorios/"]) {
  const tSel = pagesOut.pages["/territorios/"]._selectors || {};
  territoryPages.forEach((p, i) => {
    const enPage = pagesOut.pages[p.path]?.en;
    if (!enPage) return;
    const n = i + 1;
    tSel[`.seo-card:nth-child(${n}) h2 a`] = { en: enPage.h1 };
    tSel[`.seo-card:nth-child(${n}) p`] = { en: enPage.intro };
    tSel[`.seo-card:nth-child(${n}) .btn`] = { en: `Invest in ${enPage.h1} →` };
  });
  pagesOut.pages["/territorios/"]._selectors = tSel;
}

const servicePages = pagesEs.filter((p) => p.type === "service");
if (pagesOut.pages["/servicios/"]) {
  const sSel = pagesOut.pages["/servicios/"]._selectors || {};
  servicePages.forEach((p, i) => {
    const enPage = pagesOut.pages[p.path]?.en;
    if (!enPage) return;
    const n = i + 1;
    sSel[`.seo-card:nth-child(${n}) h2 a`] = { en: enPage.h1 };
    sSel[`.seo-card:nth-child(${n}) p`] = { en: enPage.intro };
    sSel[`.seo-card:nth-child(${n}) .btn`] = { en: "View service →" };
  });
  pagesOut.pages["/servicios/"]._selectors = sSel;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pagesOut, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "..", "i18n", "es", "seo-pages.json"), "{}\n", "utf8");
console.log(`wrote ${OUT} (${Object.keys(pagesOut.pages).length} pages)`);
