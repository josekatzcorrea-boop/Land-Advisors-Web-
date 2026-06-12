/**
 * Land Advisors — eventos de conversión (CTA, formulario, WhatsApp)
 */
(function () {
  function track(el) {
    const event = el.getAttribute("data-track") || el.getAttribute("data-cta");
    if (!event || typeof window.LA_track !== "function") return;
    window.LA_track(event, {
      cta_label: (el.textContent || "").trim().slice(0, 80),
      cta_href: el.getAttribute("href") || "",
      page_path: location.pathname,
    });
  }

  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-track], [data-cta], .nav-cta, .btn-primary");
    if (el) track(el);
  });

  document.querySelectorAll(".contact-form").forEach(function (form) {
    form.addEventListener("submit", function () {
      if (typeof window.LA_track === "function") {
        const perfil = form.querySelector("[name=perfil], [name=intent]");
        window.LA_track("form_submit", {
          form_intent: perfil ? perfil.value : "",
          page_path: location.pathname,
        });
      }
    });
  });

  document.getElementById("la-chat-widget")?.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      if (typeof window.LA_track === "function") {
        window.LA_track("cta_whatsapp", { page_path: location.pathname });
      }
    }
  });
})();
