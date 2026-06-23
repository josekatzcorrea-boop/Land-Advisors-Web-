/**
 * Partners estratégicos — tarjetas, modal de lead y redirección.
 */
(function () {
  const partners = window.LA_PARTNERS || [];
  const grid = document.getElementById("partners-grid");
  const modal = document.getElementById("partner-lead-modal");
  const form = document.getElementById("partner-lead-form");
  const section = document.getElementById("partners");

  if (!grid || !modal || !form || !partners.length) return;

  let activePartner = null;
  let viewTracked = false;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const PHONE_RE = /^\+?[\d\s().-]{8,20}$/;

  function track(eventName, params) {
    if (typeof window.LA_track === "function") {
      window.LA_track(eventName, params || {});
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCards() {
    grid.innerHTML = partners
      .map(function (p) {
        var logoScale = p.logoScale || 1;
        var logoStyle =
          logoScale !== 1
            ? ' style="--partner-logo-scale:' + logoScale + '"'
            : "";
        var nameHtml =
          p.showName === false
            ? ""
            : "<h3>" + escapeHtml(p.name) + "</h3>";
        return (
          '<article class="partner-card glass-card" data-partner-id="' +
          escapeHtml(p.id) +
          '">' +
          '<div class="partner-card-logo"' +
          logoStyle +
          ">" +
          '<img src="' +
          escapeHtml(p.logo) +
          '" alt="' +
          escapeHtml(p.name) +
          '" loading="lazy">' +
          "</div>" +
          nameHtml +
          "<p>" +
          escapeHtml(p.description) +
          "</p>" +
          '<button type="button" class="btn btn-primary btn-glow partner-card-cta" data-partner-id="' +
          escapeHtml(p.id) +
          '">Solicitar contacto</button>' +
          "</article>"
        );
      })
      .join("");
  }

  function getPartner(id) {
    return partners.find(function (p) {
      return p.id === id;
    });
  }

  function setFieldError(field, message) {
    const wrap = field.closest(".partner-field");
    if (!wrap) return;
    let err = wrap.querySelector(".partner-field-error");
    if (!err) {
      err = document.createElement("p");
      err.className = "partner-field-error";
      err.setAttribute("role", "alert");
      wrap.appendChild(err);
    }
    err.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
    wrap.classList.toggle("is-invalid", Boolean(message));
  }

  function clearErrors() {
    form.querySelectorAll(".partner-field").forEach(function (wrap) {
      wrap.classList.remove("is-invalid");
      const err = wrap.querySelector(".partner-field-error");
      if (err) err.textContent = "";
    });
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });
  }

  function validateForm() {
    clearErrors();
    let valid = true;
    const data = new FormData(form);

    if (data.get("website")) return false;

    const nombre = String(data.get("nombre") || "").trim();
    const email = String(data.get("email") || "").trim();
    const telefono = String(data.get("telefono") || "").trim();
    const comentario = String(data.get("comentario") || "").trim();

    const nombreEl = form.querySelector('[name="nombre"]');
    const emailEl = form.querySelector('[name="email"]');
    const telEl = form.querySelector('[name="telefono"]');
    const comEl = form.querySelector('[name="comentario"]');

    if (!nombre || nombre.length < 2) {
      setFieldError(nombreEl, "Ingresa tu nombre completo.");
      valid = false;
    }

    if (!email || !EMAIL_RE.test(email)) {
      setFieldError(emailEl, "Ingresa un correo electrónico válido.");
      valid = false;
    }

    const digits = telefono.replace(/\D/g, "");
    if (!telefono || !PHONE_RE.test(telefono) || digits.length < 8) {
      setFieldError(telEl, "Ingresa un teléfono válido (mínimo 8 dígitos).");
      valid = false;
    }

    if (!comentario || comentario.length < 5) {
      setFieldError(comEl, "Cuéntanos brevemente tu necesidad o proyecto.");
      valid = false;
    }

    return valid;
  }

  function setFormStatus(message, type) {
    const el = form.querySelector(".partner-form-status");
    if (!el) return;
    el.textContent = message || "";
    el.hidden = !message;
    el.dataset.type = type || "";
  }

  function setSubmitting(submitting) {
    const btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    if (submitting) {
      if (!btn.dataset.label) btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Enviando…";
    } else {
      btn.disabled = false;
      if (btn.dataset.label) btn.textContent = btn.dataset.label;
    }
  }

  function openModal(partnerId) {
    activePartner = getPartner(partnerId);
    if (!activePartner) return;

    form.reset();
    clearErrors();
    setFormStatus("", "");
    form.querySelector('[name="partner"]').value = activePartner.name;

    const title = modal.querySelector(".partner-modal-title");
    if (title) {
      title.textContent = "Solicitar contacto con " + activePartner.name;
    }

    modal.showModal();
    document.body.classList.add("partner-modal-open");

    track("partner_form_open", {
      partner_id: activePartner.id,
      partner_name: activePartner.name,
      page_path: location.pathname,
    });

    const first = form.querySelector('[name="nombre"]');
    if (first) window.setTimeout(function () { first.focus(); }, 80);
  }

  function closeModal() {
    modal.close();
    document.body.classList.remove("partner-modal-open");
    activePartner = null;
  }

  renderCards();

  grid.addEventListener("click", function (e) {
    const btn = e.target.closest(".partner-card-cta");
    if (!btn) return;
    openModal(btn.getAttribute("data-partner-id"));
  });

  modal.querySelectorAll("[data-partner-modal-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  modal.addEventListener("cancel", function (e) {
    e.preventDefault();
    closeModal();
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!activePartner || !validateForm()) return;

    const data = new FormData(form);
    const lead = {
      nombre: data.get("nombre"),
      email: data.get("email"),
      telefono: data.get("telefono"),
      comentario: data.get("comentario"),
      partner: data.get("partner") || activePartner.name,
      ciudad: "",
    };

    setSubmitting(true);
    setFormStatus("", "");

    window
      .savePartnerLead(lead)
      .then(function () {
        track("partner_lead_submit", {
          partner_id: activePartner.id,
          partner_name: activePartner.name,
          page_path: location.pathname,
        });

        setFormStatus(
          "Gracias. Hemos registrado tu solicitud y te pondremos en contacto con " +
            activePartner.name +
            ".",
          "success"
        );

        window.setTimeout(function () {
          track("partner_redirect", {
            partner_id: activePartner.id,
            partner_name: activePartner.name,
            redirect_url: activePartner.redirectUrl,
            page_path: location.pathname,
          });
          window.location.href = activePartner.redirectUrl;
        }, 2000);
      })
      .catch(function () {
        setFormStatus(
          "No pudimos registrar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.",
          "error"
        );
        setSubmitting(false);
      });
  });

  if (section && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !viewTracked) {
            viewTracked = true;
            track("partner_view", { page_path: location.pathname });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(section);
  }
})();
