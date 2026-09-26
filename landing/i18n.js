/**
 * Land Advisors — i18n (ES / EN)
 * Carga diccionarios por página y aplica traducciones nativas.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "la-lang";
  var MANUAL_KEY = "la-lang-manual";
  var DEFAULT_LANG = "es";
  var CHILE_TZ = { "America/Santiago": 1, "America/Punta_Arenas": 1, "Pacific/Easter": 1 };

  function prefix() {
    var p = document.documentElement.getAttribute("data-i18n-prefix");
    if (p) return p;
    var depth = (location.pathname.match(/\//g) || []).length;
    if (location.pathname.indexOf("/landing/") !== -1) depth = Math.max(0, depth - 1);
    if (depth <= 1) return "";
    var up = "";
    for (var i = 0; i < depth - 1; i++) up += "../";
    return up;
  }

  function isLikelyInChile() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (CHILE_TZ[tz]) return true;
    } catch (e) {}
    var langs = navigator.languages && navigator.languages.length
      ? Array.prototype.slice.call(navigator.languages)
      : [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      if ((langs[i] || "").toLowerCase().indexOf("es-cl") === 0) return true;
    }
    return false;
  }

  /** Geo por IP (país). Timeout corto; null = falló / sin respuesta. */
  function detectCountryCode() {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timedOut = false;
    var timer = setTimeout(function () {
      timedOut = true;
      if (controller) controller.abort();
    }, 1500);

    var opts = { cache: "no-store" };
    if (controller) opts.signal = controller.signal;

    return fetch("https://get.geojs.io/v1/ip/country.json", opts)
      .then(function (r) {
        if (!r.ok) throw new Error("geo http");
        return r.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        if (timedOut) return null;
        var code = (data && (data.country || data.country_code)) || "";
        return String(code).toUpperCase() || null;
      })
      .catch(function () {
        clearTimeout(timer);
        return null;
      });
  }

  function defaultLangFromCountry(country) {
    if (country === "CL") return "es";
    if (country) return "en";
    return isLikelyInChile() ? "es" : "en";
  }

  function getLangFromStorageOrQuery() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "es") return q;
    if (localStorage.getItem(MANUAL_KEY) === "1") {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "es") return stored;
    }
    return null;
  }

  var EN_PATH_RE = /^(\/landing)?\/en(\/|$)/;

  function isEnPath() {
    return EN_PATH_RE.test(location.pathname);
  }

  /** Crawlers y navegadores headless: nunca redirigir por geo/idioma. */
  function isBot() {
    return /bot|crawl|spider|slurp|mediapartners|lighthouse|headless|inspectiontool|facebookexternalhit|embedly|preview/i.test(
      navigator.userAgent || ""
    );
  }

  /** URL local de la versión equivalente, leída desde <link rel="alternate" hreflang>. */
  function alternateUrl(lang) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    if (!link) return null;
    var target;
    try {
      target = new URL(link.getAttribute("href"), location.href);
    } catch (e) {
      return null;
    }
    var p = target.pathname;
    if (location.pathname.indexOf("/landing/") === 0) p = "/landing" + p;
    var params = new URLSearchParams(location.search);
    params.delete("lang");
    var qs = params.toString();
    return p + (qs ? "?" + qs : "") + location.hash;
  }

  function goToLang(lang, replace) {
    var url = alternateUrl(lang);
    if (!url) return false;
    if (replace) location.replace(url);
    else location.assign(url);
    return true;
  }

  function getLang() {
    if (isEnPath()) return "en";
    var forced = getLangFromStorageOrQuery();
    if (forced) return forced;
    if (window.__LA_GEO_LANG === "en" || window.__LA_GEO_LANG === "es") {
      return window.__LA_GEO_LANG;
    }
    return isLikelyInChile() ? DEFAULT_LANG : "en";
  }

  function merge() {
    var out = {};
    for (var i = 0; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src) continue;
      Object.keys(src).forEach(function (k) {
        out[k] = src[k];
      });
    }
    return out;
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("i18n missing: " + url);
      return r.json();
    });
  }

  function loadDictionaries(lang, page) {
    var base = prefix() + "i18n/" + lang + "/";
    var chain = [fetchJson(base + "common.json")];
    if (page === "home") chain.push(fetchJson(base + "home.json"));
    if (page === "plh") chain.push(fetchJson(base + "plh.json"));
    if (page === "seo" || page === "campaign") {
      chain.push(fetchJson(base + "seo-pages.json").catch(function () { return {}; }));
    }
    return Promise.all(chain).then(function (parts) {
      return merge.apply(null, parts);
    });
  }

  function t(dict, key, lang) {
    if (!key) return "";
    var val = dict[key];
    if (val == null) return "";
    if (typeof val === "object" && (val.es || val.en)) return val[lang] || val.es || "";
    return val;
  }

  function setMetaContent(selector, value) {
    if (!value) return;
    var el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }

  function syncShareMeta(title, description) {
    if (title) {
      document.title = title;
      setMetaContent('meta[property="og:title"]', title);
      setMetaContent('meta[name="twitter:title"]', title);
    }
    if (description) {
      setMetaContent('meta[name="description"]', description);
      setMetaContent('meta[property="og:description"]', description);
      setMetaContent('meta[name="twitter:description"]', description);
    }
  }

  function applySelectors(selectors, lang) {
    if (!selectors) return;
    Object.keys(selectors).forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      var entry = selectors[sel];
      var val = entry[lang] || entry.es;
      if (!val) return;
      if (entry.attr) el.setAttribute(entry.attr, val);
      else if (entry.html) el.innerHTML = val;
      else el.textContent = val;
    });
  }

  var ES_MONTHS = {
    enero: "January", febrero: "February", marzo: "March", abril: "April", mayo: "May", junio: "June",
    julio: "July", agosto: "August", septiembre: "September", setiembre: "September", octubre: "October",
    noviembre: "November", diciembre: "December",
    ene: "Jan", feb: "Feb", mar: "Mar", abr: "Apr", may: "May", jun: "Jun", jul: "Jul", ago: "Aug",
    sept: "Sep", sep: "Sep", oct: "Oct", nov: "Nov", dic: "Dec"
  };

  function translateEsDate(s) {
    var m = s.match(/^(\d{1,2}) de ([a-záéíóú]+) de (\d{4})$/i);
    if (m && ES_MONTHS[m[2].toLowerCase()]) return ES_MONTHS[m[2].toLowerCase()] + " " + m[1] + ", " + m[3];
    m = s.match(/^(\d{1,2}) ([a-z]+)\.? (\d{4})$/i);
    if (m && ES_MONTHS[m[2].toLowerCase()]) return ES_MONTHS[m[2].toLowerCase()] + " " + m[1] + ", " + m[3];
    return null;
  }

  function translatePhrase(key, phrases, patterns) {
    if (Object.prototype.hasOwnProperty.call(phrases, key)) return phrases[key];
    for (var i = 0; i < patterns.length; i++) {
      var re = new RegExp(patterns[i][0]);
      if (re.test(key)) {
        return key.replace(re, function () {
          var args = arguments;
          return patterns[i][1].replace(/\$(\d)/g, function (_, n) {
            var part = args[Number(n)] || "";
            if (Object.prototype.hasOwnProperty.call(phrases, part)) return phrases[part];
            return translateEsDate(part) || part;
          });
        });
      }
    }
    return translateEsDate(key);
  }

  function applyPhrases(dict, lang) {
    if (lang !== "en" || !document.body) return;
    var phrases = merge(dict._commonPhrases, dict._phrases);
    var patterns = dict._commonPatterns || [];
    var skip = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (!node.parentNode || skip[node.parentNode.nodeName]) return;
      var raw = node.nodeValue;
      var key = raw.replace(/\s+/g, " ").trim();
      if (key.length < 2) return;
      var en = translatePhrase(key, phrases, patterns);
      if (en == null || en === key) return;
      node.nodeValue = raw.match(/^\s*/)[0] + en + raw.match(/\s*$/)[0];
    });
    ["alt", "aria-label", "placeholder", "title"].forEach(function (attr) {
      document.querySelectorAll("[" + attr + "]").forEach(function (el) {
        var key = (el.getAttribute(attr) || "").replace(/\s+/g, " ").trim();
        if (key.length < 2) return;
        var en = translatePhrase(key, phrases, patterns);
        if (en != null && en !== key) el.setAttribute(attr, en);
      });
    });
  }

  function applyBlocks(blocks, lang) {
    if (!blocks || lang !== "en") return;
    blocks.forEach(function (block) {
      if (block.idx == null) return;
      var el = document.querySelector('[data-i18n-block="' + block.idx + '"]');
      if (!el) return;

      if (block.type === "p" && block.prefix && block.en) {
        el.innerHTML = "<strong>" + block.prefix.trim().replace(/:$/, "") + ":</strong> " + block.en;
        return;
      }

      if (block.type === "ul" && block.items && block.items.length) {
        var lis = el.querySelectorAll("li");
        block.items.forEach(function (text, i) {
          if (lis[i]) lis[i].textContent = text;
        });
        return;
      }

      if (block.type === "roadmap") {
        var lbl = el.querySelector(".section-label");
        if (lbl && block.label) lbl.textContent = block.label;
        var rh = el.querySelector(".guide-roadmap__heading");
        if (rh && block.title) rh.textContent = block.title;
        if (block.items) {
          var rItems = el.querySelectorAll(".guide-roadmap__item");
          block.items.forEach(function (item, i) {
            if (!rItems[i]) return;
            var t = rItems[i].querySelector(".guide-roadmap__title");
            var tx = rItems[i].querySelector(".guide-roadmap__text");
            if (t && item.title) t.textContent = item.title;
            if (tx && item.text) tx.textContent = item.text;
          });
        }
        return;
      }

      if (block.type === "step") {
        var st = el.querySelector(".guide-step__title");
        if (st && block.title) st.textContent = block.title;
        if (block.paragraphs) {
          var ps = el.querySelectorAll(".guide-step__body > p");
          block.paragraphs.forEach(function (text, i) {
            if (ps[i]) ps[i].textContent = text;
          });
        }
        if (block.bullets) {
          var bl = el.querySelectorAll(".guide-step__bullets li");
          block.bullets.forEach(function (text, i) {
            if (bl[i]) bl[i].textContent = text;
          });
        }
        if (block.examples) {
          var ex = el.querySelectorAll(".guide-example-card");
          block.examples.forEach(function (item, i) {
            if (!ex[i]) return;
            var et = ex[i].querySelector(".guide-example-card__title");
            var ep = ex[i].querySelector("p");
            if (et && item.title) et.textContent = item.title;
            if (ep && item.text) ep.textContent = item.text;
          });
        }
        return;
      }

      if (block.type === "criteria") {
        var ct = el.querySelector(".blog-article__h2");
        if (ct && block.title) ct.textContent = block.title;
        var ci = el.querySelector(".guide-criteria__intro");
        if (ci && block.intro) ci.textContent = block.intro;
        if (block.items) {
          var cards = el.querySelectorAll(".guide-criteria-card");
          block.items.forEach(function (item, i) {
            if (!cards[i]) return;
            var ctt = cards[i].querySelector(".guide-criteria-card__title");
            var cp = cards[i].querySelector("p");
            if (ctt && item.title) ctt.textContent = item.title;
            if (cp && item.text) cp.textContent = item.text;
          });
        }
        return;
      }

      if (block.type === "decision") {
        var dt = el.querySelector(".blog-article__h2");
        if (dt && block.title) dt.textContent = block.title;
        if (block.intro) {
          var di = el.querySelector(".guide-decision > p");
          if (di) di.textContent = block.intro;
        }
        if (block.groups) {
          var groups = el.querySelectorAll(".guide-decision-group");
          block.groups.forEach(function (group, gi) {
            if (!groups[gi]) return;
            var gl = groups[gi].querySelector(".guide-decision-group__title");
            if (gl && group.label) gl.textContent = group.label;
            if (group.items) {
              var dc = groups[gi].querySelectorAll(".guide-decision-card");
              group.items.forEach(function (item, ii) {
                if (!dc[ii]) return;
                var dct = dc[ii].querySelector(".guide-decision-card__title");
                var dcp = dc[ii].querySelector("p");
                if (dct && item.title) dct.textContent = item.title;
                if (dcp && item.text) dcp.textContent = item.text;
              });
            }
          });
        }
        return;
      }

      if (block.type === "callout") {
        var cot = el.querySelector(".guide-callout__title");
        var cop = el.querySelector(".guide-callout__copy > p");
        if (cot && block.title) cot.textContent = block.title;
        if (cop && block.text) cop.textContent = block.text;
        if (block.cta && block.cta.label) {
          var coca = el.querySelector(".guide-callout__copy a");
          if (coca) coca.textContent = block.cta.label;
        }
        return;
      }

      if (block.html && block.en) el.innerHTML = block.en;
      else if (block.en) el.textContent = block.en;
    });
  }

  function applyPageTranslations(page, lang) {
    if (!page) return;
    var pt = page[lang] || page.es;
    if (pt) {
      syncShareMeta(pt.title, pt.description);
      var h1 = document.querySelector(".seo-hero h1, .campaign-hero h1, .campaign-hero--intent h1");
      if (h1 && pt.h1) h1.textContent = pt.h1;
      var intro = document.querySelector(".seo-hero .section-intro, .campaign-hero__lead, .blog-article__lead");
      if (intro && pt.intro) intro.textContent = pt.intro;
      var crumb = document.querySelector(".seo-breadcrumb span:last-child");
      if (crumb && pt.breadcrumb) crumb.textContent = pt.breadcrumb;
      var label = document.querySelector(".seo-hero .section-label, .campaign-hero .section-label");
      if (label && pt.label) label.textContent = pt.label;
    }
    applySelectors(page._selectors, lang);
    applyBlocks(page.blocks, lang);
  }

  function applyDict(dict, lang) {
    document.documentElement.lang = lang === "en" ? "en" : "es";
    document.documentElement.setAttribute("data-lang", lang);

    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", lang === "en" ? "en_US" : "es_CL");

    var ogAlt = document.querySelector('meta[property="og:locale:alternate"]');
    if (ogAlt) ogAlt.setAttribute("content", lang === "en" ? "es_CL" : "en_US");

    if (lang === "en") {
      var waIntro = document.documentElement.getAttribute("data-wa-intro-en") || dict["wa.intro"];
      if (waIntro) document.documentElement.setAttribute("data-wa-intro", waIntro);
    } else {
      var waEs = document.documentElement.getAttribute("data-wa-intro-es");
      if (waEs) document.documentElement.setAttribute("data-wa-intro", waEs);
    }

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(dict, key, lang);
      if (val) el.textContent = val;
    });

    document.querySelectorAll("option[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(dict, key, lang);
      if (val) el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      var val = t(dict, key, lang);
      if (val) el.innerHTML = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      var val = t(dict, key, lang);
      if (val) el.setAttribute("placeholder", val);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      var val = t(dict, key, lang);
      if (val) el.setAttribute("aria-label", val);
    });

    applySelectors(dict._commonSelectors, lang);
    applySelectors(dict._selectors, lang);

    var seoPath = document.body.getAttribute("data-seo-path");
    if (seoPath && dict.pages && dict.pages[seoPath]) {
      applyPageTranslations(dict.pages[seoPath], lang);
    }

    if (dict.meta && dict.meta[lang]) {
      syncShareMeta(dict.meta[lang].title, dict.meta[lang].description);
    }

    applyPhrases(dict, lang);

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    window.__LA_I18N_DICT = dict;
    document.dispatchEvent(new CustomEvent("la:langchange", { detail: { lang: lang, dict: dict } }));
    window.__LA_I18N_LANG = lang;
  }

  function navigateLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    var url = new URL(location.href);
    if (lang === "es") url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang);
    location.assign(url.pathname + url.search + url.hash);
  }

  function bindSwitcher() {
    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var lang = btn.getAttribute("data-lang");
        if (!lang || lang === getLang()) return;
        localStorage.setItem(MANUAL_KEY, "1");
        localStorage.setItem(STORAGE_KEY, lang);
        if (goToLang(lang, false)) return;
        navigateLang(lang);
      });
    });
  }

  function bootWithLang(lang) {
    window.__LA_GEO_LANG = lang;
    window.LA_LANG = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    var page = document.body.getAttribute("data-page") || "seo";

    loadDictionaries(lang, page)
      .then(function (dict) {
        applyDict(dict, lang);
        document.documentElement.classList.remove("i18n-loading");
        bindSwitcher();
      })
      .catch(function () {
        document.documentElement.classList.remove("i18n-loading");
        bindSwitcher();
      });
  }

  function init() {
    if (isEnPath()) {
      if (new URLSearchParams(location.search).get("lang") === "es" && goToLang("es", true)) return;
      bootWithLang("en");
      return;
    }

    var forced = getLangFromStorageOrQuery();
    // ?lang=en y preferencia EN guardada: ir a la URL /en/ equivalente
    if (forced === "en" && goToLang("en", true)) return;
    if (forced) {
      bootWithLang(forced);
      return;
    }

    if (isBot()) {
      bootWithLang(DEFAULT_LANG);
      return;
    }

    detectCountryCode().then(function (country) {
      var lang = defaultLangFromCountry(country);
      window.__LA_GEO_LANG = lang;
      window.__LA_GEO_COUNTRY = country || "";

      // Visitantes fuera de Chile: versión /en/ equivalente (o ?lang=en si no existe)
      if (lang === "en") {
        if (goToLang("en", true)) return;
        var url = new URL(location.href);
        if (url.searchParams.get("lang") !== "en") {
          navigateLang("en");
          return;
        }
      }

      // Chile: español sin ?lang= (canónico ES)
      bootWithLang(lang);
    });
  }

  window.LA_i18n = {
    getLang: getLang,
    load: loadDictionaries,
    apply: applyDict,
    t: function (dict, key) { return t(dict, key, getLang()); },
    isLikelyInChile: isLikelyInChile,
  };

  if (window.__LA_I18N_PRERENDER) return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
