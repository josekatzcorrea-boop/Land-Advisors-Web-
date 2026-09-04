#!/usr/bin/env node
/**
 * Genera landing/i18n/en/seo-pages.json desde pages.json + posts + cases
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEO = path.join(__dirname, "..", "seo");
const OUT = path.join(__dirname, "..", "i18n", "en", "seo-pages.json");

const pages = JSON.parse(fs.readFileSync(path.join(SEO, "pages.json"), "utf8"));
const blogData = JSON.parse(fs.readFileSync(path.join(SEO, "posts.json"), "utf8"));
const casesData = JSON.parse(fs.readFileSync(path.join(SEO, "cases.json"), "utf8"));

const EN = {
  "/servicios/": {
    title: "Real estate advisory services catalog | Land Advisors",
    h1: "Services catalog",
    intro: "Advisory to buy the right land in the Lago Llanquihue and Malalcahuello basin. Territory first, property second — each service is contracted independently.",
    breadcrumb: "Services",
    label: "Services",
    description: "Strategic diagnostic, personalized land search, purchase advisory, potential studies and project structuring in Southern Chile. Prices in UF.",
  },
  "/servicios/diagnostico-estrategico/": {
    title: "Strategic real estate diagnostic | Land Advisors Chile",
    h1: "Strategic real estate diagnostic",
    intro: "Ideal if you don't yet know which zone or criteria to use.",
    breadcrumb: "Strategic diagnostic",
    label: "Service",
  },
  "/servicios/busqueda-personalizada/": {
    title: "Personalized land search | Land Advisors",
    h1: "Personalized land search",
    intro: "For those who want options with criteria, not a mass catalog. Includes strategic diagnostic.",
    breadcrumb: "Personalized search",
    label: "Service",
  },
  "/servicios/asesoria-compra/": {
    title: "Land purchase advisory | Land Advisors Chile",
    h1: "Purchase and acquisition advisory",
    intro: "For those who already chose a plot and need negotiation support, document review and closing.",
    breadcrumb: "Purchase advisory",
    label: "Service",
  },
  "/servicios/estudio-potencial-inmobiliario/": {
    title: "Real estate potential study | Land Advisors",
    h1: "Real estate potential study",
    intro: "Establish the commercial vocation of a plot, the optimal project and why.",
    breadcrumb: "Potential study",
    label: "Service",
  },
  "/servicios/estructuracion-proyectos/": {
    title: "Project structuring | Land Advisors",
    h1: "Project structuring",
    intro: "Cabins, tourism or commercial: feasibility and plan before building.",
    breadcrumb: "Project structuring",
    label: "Service",
  },
  "/territorios/": {
    title: "Territories — Southern Chile | Land Advisors",
    h1: "Territories where we work",
    intro: "Knowledge and strategy in the Lago Llanquihue basin and Malalcahuello.",
    breadcrumb: "Territories",
    label: "Territories",
  },
  "/territorios/puerto-varas/": {
    h1: "Puerto Varas",
    intro: "Urban hub and rural contour — territorial reading for buyers and investors.",
    breadcrumb: "Puerto Varas",
    label: "Territory",
  },
  "/territorios/frutillar/": {
    h1: "Frutillar",
    intro: "Culture, lake and rural contour — opportunities with territorial criteria.",
    breadcrumb: "Frutillar",
    label: "Territory",
  },
  "/territorios/llanquihue/": {
    h1: "Llanquihue",
    intro: "Present value vs. future potential in a changing rural contour.",
    breadcrumb: "Llanquihue",
    label: "Territory",
  },
  "/territorios/malalcahuello/": {
    h1: "Malalcahuello",
    intro: "Mountain, tourism and lifestyle projects in a distinct territorial setting.",
    breadcrumb: "Malalcahuello",
    label: "Territory",
  },
  "/inteligencia-territorial/": {
    h1: "Territorial intelligence",
    intro: "How we read territory, market and normative context before recommending land.",
    breadcrumb: "Territorial intelligence",
    label: "Intelligence",
  },
  "/indice-territorial/": {
    h1: "Land Advisors Territorial Index (ILA)",
    intro: "Structured territorial index for the Lago Llanquihue basin.",
    breadcrumb: "Territorial index",
    label: "Index",
  },
  "/casos-de-estudio/": {
    h1: "Case studies",
    intro: "Real decisions with territorial and market criteria — Puerto Varas, Frutillar, Llanquihue.",
    breadcrumb: "Case studies",
    label: "Cases",
  },
  "/blog/": {
    h1: "Blog",
    intro: "Territorial analysis, market and criteria for buying land in Southern Chile.",
    breadcrumb: "Blog",
    label: "Blog",
  },
  "/guias/": {
    h1: "Guides",
    intro: "Step-by-step guides for buying land in Southern Chile with criteria.",
    breadcrumb: "Guides",
    label: "Guides",
  },
  "/guias/comprar-terreno-sur-chile/": {
    h1: "How to buy land in Southern Chile",
    intro: "Structured guide for buyers — zone, criteria and process.",
    breadcrumb: "Buy land in Southern Chile",
    label: "Guide",
  },
  "/patagonia-land-hunter/": {
    title: "Local Land Acquisition Partner — Patagonia & Southern Chile | Land Advisors",
    h1: "Find your place in Southern Chile.",
    intro: "Active land search and independent buyer representation.",
    breadcrumb: "Patagonia Land Hunter",
    label: "Service",
  },
};

const pagesOut = { pages: {} };

for (const p of pages) {
  if (p.path === "/") continue;
  const en = EN[p.path];
  if (en) {
    pagesOut.pages[p.path] = { en };
  }
}

for (const post of blogData.posts || []) {
  const pathKey = `/blog/${post.slug}/`;
  pagesOut.pages[pathKey] = {
    en: {
      title: post.titleEn || post.title,
      h1: post.h1En || post.h1 || post.title,
      intro: post.excerptEn || post.excerpt || post.description,
      breadcrumb: post.titleEn || post.title,
      label: "Article",
    },
  };
}

for (const cs of casesData.cases || []) {
  const pathKey = `/casos-de-estudio/${cs.slug}/`;
  pagesOut.pages[pathKey] = {
    en: {
      title: cs.titleEn || cs.title,
      h1: cs.h1En || cs.h1 || cs.title,
      intro: cs.introEn || cs.intro,
      breadcrumb: cs.titleEn || cs.title,
      label: "Case study",
    },
  };
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pagesOut, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "..", "i18n", "es", "seo-pages.json"), "{}\n", "utf8");
console.log("wrote i18n/en/seo-pages.json");
