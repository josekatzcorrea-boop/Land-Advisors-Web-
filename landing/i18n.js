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

    if (page === "seo") chain.push(fetchJson(base + "seo-pages.json").catch(function () { return {}; }));

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



  function applyDict(dict, lang) {

    document.documentElement.lang = lang === "en" ? "en" : "es";

    document.documentElement.setAttribute("data-lang", lang);



    var ogLocale = document.querySelector('meta[property="og:locale"]');

    if (ogLocale) ogLocale.setAttribute("content", lang === "en" ? "en_US" : "es_CL");



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



    if (dict._selectors) {

      Object.keys(dict._selectors).forEach(function (sel) {

        var el = document.querySelector(sel);

        if (!el) return;

        var entry = dict._selectors[sel];

        var val = entry[lang] || entry.es;

        if (!val) return;

        if (entry.html) el.innerHTML = val;

        else el.textContent = val;

      });

    }



    var seoPath = document.body.getAttribute("data-seo-path");

    if (seoPath && dict.pages && dict.pages[seoPath]) {

      var page = dict.pages[seoPath];

      var pt = page[lang] || page.es;

      if (pt) {

        if (pt.title) document.title = pt.title;

        if (pt.description) {

          var desc = document.querySelector('meta[name="description"]');

          if (desc) desc.setAttribute("content", pt.description);

        }

        var h1 = document.querySelector(".seo-hero h1");

        if (h1 && pt.h1) h1.textContent = pt.h1;

        var intro = document.querySelector(".seo-hero .section-intro");

        if (intro && pt.intro) intro.textContent = pt.intro;

        var crumb = document.querySelector(".seo-breadcrumb span:last-child");

        if (crumb && pt.breadcrumb) crumb.textContent = pt.breadcrumb;

        var label = document.querySelector(".seo-hero .section-label");

        if (label && pt.label) label.textContent = pt.label;

      }

    }



    if (dict.meta && dict.meta[lang]) {

      if (dict.meta[lang].title) document.title = dict.meta[lang].title;

      if (dict.meta[lang].description) {

        var m = document.querySelector('meta[name="description"]');

        if (m) m.setAttribute("content", dict.meta[lang].description);

      }

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

