(function () {
  const grid = document.getElementById("ila-sector-grid");
  const controls = document.querySelector("[data-ila-controls]");
  if (!grid || !controls) return;

  let activeProfile = "patrimonio";
  let activeComuna = "all";

  function scoreTier(score) {
    if (score >= 80) return "ila-score--high";
    if (score >= 65) return "ila-score--mid";
    return "ila-score--low";
  }

  function updateCards() {
    const cards = grid.querySelectorAll(".ila-card");
    cards.forEach((card) => {
      const comuna = card.getAttribute("data-comuna");
      const profiles = (card.getAttribute("data-profiles") || "").split(",");
      let scores = {};
      try {
        scores = JSON.parse(card.getAttribute("data-profile-scores") || "{}");
      } catch (_) {
        scores = {};
      }
      const global = Number(card.getAttribute("data-global-score")) || 0;
      const profileScore = scores[activeProfile] ?? global;

      const showComuna = activeComuna === "all" || comuna === activeComuna;
      const showProfile = profiles.includes(activeProfile);
      card.hidden = !(showComuna && showProfile);

      const scoreEl = card.querySelector(".ila-card__score");
      const numEl = card.querySelector(".ila-card__score-num");
      if (scoreEl && numEl) {
        numEl.textContent = String(profileScore);
        scoreEl.className = `ila-card__score ${scoreTier(profileScore)}`;
        scoreEl.setAttribute("aria-label", `ILA perfil ${activeProfile}: ${profileScore}`);
      }
    });
  }

  controls.querySelectorAll(".ila-profile-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeProfile = btn.getAttribute("data-ila-profile") || "patrimonio";
      controls.querySelectorAll(".ila-profile-tab").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      updateCards();
    });
  });

  controls.querySelectorAll(".ila-comuna-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeComuna = btn.getAttribute("data-ila-comuna") || "all";
      controls.querySelectorAll(".ila-comuna-tab").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      updateCards();
    });
  });

  updateCards();

  const hash = window.location.hash.replace("#", "");
  if (hash.startsWith("sector-")) {
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("ila-card--highlight");
      setTimeout(() => target.classList.remove("ila-card--highlight"), 2400);
    }
  }
})();
