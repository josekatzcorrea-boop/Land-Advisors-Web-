/**
 * Land Advisors — cablea atributos de CTA; el lead-gate intercepta el click.
 * data-site-wa | data-site-calendar → #lead-gate (formulario primero)
 */
(function () {
  const GATE = "#lead-gate";

  function wire() {
    document.querySelectorAll("[data-site-wa]").forEach((el) => {
      if (el.closest(".contact-success") || el.closest(".campaign-lead-success")) return;
      el.setAttribute("href", GATE);
      el.removeAttribute("target");
    });

    document.querySelectorAll("[data-site-calendar]").forEach((el) => {
      if (el.closest(".contact-success") || el.closest(".campaign-lead-success")) return;
      el.setAttribute("href", GATE);
      el.removeAttribute("target");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
