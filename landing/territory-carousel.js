(function () {
  const wrap = document.querySelector(".territory-carousel-wrap");
  if (!wrap) return;

  const carousel = wrap.querySelector(".territory-carousel");
  const track = wrap.querySelector(".territory-carousel-track");
  const prevBtn = wrap.querySelector(".territory-carousel-btn--prev");
  const nextBtn = wrap.querySelector(".territory-carousel-btn--next");
  const edgePrev = wrap.querySelector(".territory-carousel-edge--prev");
  const edgeNext = wrap.querySelector(".territory-carousel-edge--next");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scrollAmount() {
    const figure = track?.querySelector("figure");
    if (!figure) return carousel.clientWidth * 0.75;
    const gap = parseFloat(getComputedStyle(track).gap) || 16;
    return figure.offsetWidth + gap;
  }

  function maxScroll() {
    return carousel.scrollWidth - carousel.clientWidth;
  }

  function updateButtons() {
    const sl = carousel.scrollLeft;
    const max = maxScroll();
    if (prevBtn) prevBtn.disabled = sl <= 2;
    if (nextBtn) nextBtn.disabled = sl >= max - 2;
  }

  function scrollByDir(dir) {
    carousel.scrollBy({
      left: dir * scrollAmount(),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  let hoverDir = 0;
  let hoverRaf = null;

  function hoverTick() {
    if (hoverDir === 0) {
      hoverRaf = null;
      return;
    }
    carousel.scrollLeft += hoverDir * 5;
    updateButtons();
    if (hoverDir < 0 && carousel.scrollLeft <= 0) carousel.scrollLeft = 0;
    if (hoverDir > 0 && carousel.scrollLeft >= maxScroll()) carousel.scrollLeft = maxScroll();
    hoverRaf = requestAnimationFrame(hoverTick);
  }

  function startHover(dir) {
    if (reducedMotion) return;
    hoverDir = dir;
    if (!hoverRaf) hoverRaf = requestAnimationFrame(hoverTick);
  }

  function stopHover() {
    hoverDir = 0;
  }

  prevBtn?.addEventListener("click", () => scrollByDir(-1));
  nextBtn?.addEventListener("click", () => scrollByDir(1));

  edgePrev?.addEventListener("mouseenter", () => startHover(-1));
  edgeNext?.addEventListener("mouseenter", () => startHover(1));
  edgePrev?.addEventListener("mouseleave", stopHover);
  edgeNext?.addEventListener("mouseleave", stopHover);

  carousel.addEventListener("scroll", updateButtons, { passive: true });
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      scrollByDir(-1);
      e.preventDefault();
    }
    if (e.key === "ArrowRight") {
      scrollByDir(1);
      e.preventDefault();
    }
  });

  window.addEventListener("resize", updateButtons, { passive: true });
  updateButtons();
})();
