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

  function getLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "es") return q;
    if (localStorage.getItem(MANUAL_KEY) === "1") {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "es") return stored;
    }
    if (!isLikelyInChile()) return "en";
    return DEFAULT_LANG;
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

  function applyBlocks(blocks, lang) {
    if (!blocks || lang !== "en") return;
    blocks.forEach(function (block) {
      if (block.idx == null) return;
      var el = document.querySelector('[data-i18n-block="' + block.idx + '"]');
      if (!el) return;

      if (block.type === "p" && block.prefix && block.en) {
        el.innerHTML = "<strong>" + block.prefix.replace(/:$/, "") + ":</strong> " + block.en;
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
      var waIntro = document.documentElement.getAttribute("data-wa-intro-en");
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

    applySelectors(dict._selectors, lang);

    var seoPath = document.body.getAttribute("data-seo-path");
    if (seoPath && dict.pages && dict.pages[seoPath]) {
      applyPageTranslations(dict.pages[seoPath], lang);
    }

    if (dict.meta && dict.meta[lang]) {
      syncShareMeta(dict.meta[lang].title, dict.meta[lang].description);
    }

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    document.dispatchEvent(new CustomEvent("la:langchange", { detail: { lang: lang, dict: dict } }));
    window.__LA_I18N_DICT = dict;
    window.__LA_I18N_LANG = lang;
  }

  function navigateLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    var url = new URL(location.href);
    if (lang === "es") url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang);
    location.assign(url.pathname + url.search + url.hash);
  }

  function maybeRedirectLocale() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "es") return false;
    if (localStorage.getItem(MANUAL_KEY) === "1") return false;
    if (!isLikelyInChile()) {
      navigateLang("en");
      return true;
    }
    return false;
  }

  function bindSwitcher() {
    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var lang = btn.getAttribute("data-lang");
        if (!lang || lang === getLang()) return;
        localStorage.setItem(MANUAL_KEY, "1");
        navigateLang(lang);
      });
    });
  }

  function init() {
    if (maybeRedirectLocale()) return;

    var lang = getLang();
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

  window.LA_i18n = {
    getLang: getLang,
    load: loadDictionaries,
    apply: applyDict,
    t: function (dict, key) { return t(dict, key, getLang()); },
    isLikelyInChile: isLikelyInChile,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
