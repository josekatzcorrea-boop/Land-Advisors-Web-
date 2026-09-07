/** Nav principal compartido — evita superposición en header desktop */

export const NAV_CORE = [
  { id: "plh", href: "patagonia-land-hunter/", label: "Patagonia Land Hunter", i18n: "nav.plh" },
  { id: "services", href: "servicios/", label: "Servicios", i18n: "nav.services" },
  { id: "cases", href: "casos-de-estudio/", label: "Casos", i18n: "nav.cases" },
  { id: "intelligence", href: "inteligencia-territorial/", label: "Inteligencia", i18n: "nav.intelligence" },
  { id: "territories", href: "territorios/", label: "Territorios", i18n: "nav.territories" },
];

export const NAV_EXTRA = [
  { id: "guides", href: "guias/", label: "Guías", i18n: "nav.guides" },
  { id: "blog", href: "blog/", label: "Blog", i18n: "nav.blog" },
];

export const NAV_ABOUT = {
  id: "about",
  href: "#nosotros",
  label: "Nosotros",
  i18n: "nav.about",
  homeOnly: true,
};

/** @deprecated use NAV_CORE */
export const NAV_ITEMS = NAV_CORE;

const OMIT_BY_CONTEXT = {
  home: [],
  plh: ["plh"],
  "services-hub": ["services"],
  service: ["services"],
  "cases-hub": ["cases"],
  case: ["cases"],
  intelligence: ["intelligence"],
  "territories-hub": ["territories"],
  territory: ["territories"],
  "guides-hub": ["guides"],
  guide: ["guides"],
  "blog-hub": ["blog"],
  "blog-post": ["blog"],
  campaign: [],
  default: [],
};

function resolveNavItems(context) {
  const omit = new Set(OMIT_BY_CONTEXT[context] ?? OMIT_BY_CONTEXT.default);
  const items = [];

  for (const item of NAV_CORE) {
    if (!omit.has(item.id)) items.push(item);
  }
  for (const item of NAV_EXTRA) {
    if (!omit.has(item.id)) items.push(item);
  }
  if (context === "home") {
    items.push(NAV_ABOUT);
  }

  return items;
}

/** @param {string} path e.g. /servicios/diagnostico-estrategico/ */
export function navContextFromPath(path, type) {
  const p = path || "/";
  if (p === "/patagonia-land-hunter/") return "plh";
  if (p === "/servicios/") return "services-hub";
  if (p.startsWith("/servicios/")) return "service";
  if (p === "/casos-de-estudio/") return "cases-hub";
  if (p.startsWith("/casos-de-estudio/")) return "case";
  if (p === "/inteligencia-territorial/" || p === "/indice-territorial/") return "intelligence";
  if (p === "/territorios/") return "territories-hub";
  if (p.startsWith("/territorios/")) return "territory";
  if (p.startsWith("/campanas/")) return "campaign";
  if (p === "/guias/") return "guides-hub";
  if (p.startsWith("/guias/")) return "guide";
  if (p === "/blog/") return "blog-hub";
  if (p.startsWith("/blog/")) return "blog-post";
  if (type === "case-study" && p !== "/casos-de-estudio/") return "case";
  if (type === "blog-post") return "blog-post";
  if (type === "campaign") return "campaign";
  return "default";
}

/**
 * @param {object} opts
 * @param {string} [opts.prefix]
 * @param {string} [opts.context]
 * @param {object|null} [opts.campaign]
 * @param {string} [opts.langSwitchHtml]
 * @param {string} [opts.ctaMode] 'default' | 'plh' | 'campaign-lead' | 'campaign-wa'
 */
export function renderSiteNav(opts = {}) {
  const prefix = opts.prefix ?? "";
  const context = opts.context ?? "default";
  const campaign = opts.campaign ?? null;
  const langSwitchHtml = opts.langSwitchHtml ?? "";
  const ctaMode = opts.ctaMode ?? (campaign ? "campaign-wa" : "default");

  const links = resolveNavItems(context)
    .map((item) => {
      const href = item.href.startsWith("#") ? item.href : `${prefix}${item.href}`;
      return `<a href="${href}" data-i18n="${item.i18n}">${item.label}</a>`;
    })
    .join("\n            ");

  let navCta;
  if (ctaMode === "plh") {
    navCta = `<div class="nav-cta-pair nav-cta-pair--solo">
            <a href="#land-search-form" class="nav-cta nav-cta--wa" data-track="cta_plh_form" data-i18n="cta.whatsapp">WhatsApp</a>
          </div>`;
  } else if (ctaMode === "campaign-lead") {
    navCta = `<div class="nav-cta-pair">
            <a href="#campaign-lead" class="nav-cta nav-cta--wa" data-track="cta_lead_form">WhatsApp</a>
            <a href="#campaign-lead" class="nav-cta nav-cta--cal" data-track="cta_lead_form">Diagnóstico</a>
          </div>`;
  } else if (ctaMode === "campaign-wa") {
    navCta = `<div class="nav-cta-pair">
            <a href="${opts.campaignWaHref ?? "#"}" class="nav-cta nav-cta--wa" data-campaign-wa data-track="cta_whatsapp">WhatsApp</a>
            <a href="${opts.campaignCalHref ?? "#"}" class="nav-cta nav-cta--cal" data-campaign-calendar data-track="cta_calendar">Diagnóstico</a>
          </div>`;
  } else {
    navCta = `<div class="nav-cta-pair">
            <a href="${opts.siteWaHref ?? "#"}" class="nav-cta nav-cta--wa" data-site-wa data-track="cta_whatsapp" data-i18n="cta.whatsapp">WhatsApp</a>
            <a href="${opts.siteCalHref ?? "#"}" class="nav-cta nav-cta--cal" data-site-calendar data-track="cta_calendar" data-i18n="nav.diagnostic">Diagnóstico</a>
          </div>`;
  }

  return `        <nav id="main-nav" class="nav" aria-label="Principal">
          <div class="nav-links">
            ${links}
          </div>
          ${langSwitchHtml}
          ${navCta}
        </nav>`;
}
