(function () {
  const section = document.getElementById("pensamos");
  const video = document.getElementById("territorio-video");
  const figure = document.querySelector(".section-media-video");
  const replayBtn = document.getElementById("territorio-video-replay");
  if (!section || !video || !figure) return;

  const PLAYBACK_RATE = 1 / 3;
  const STOP_BEFORE_END_SEC = 1.1;

  const CANDIDATES = [
    "images/territorio.mp4",
    "images/Land Advisors Web.mp4",
    "images/Land Advisors.mp4",
    "images/Video inicial.mp4",
    "images/video-inicial.mp4",
    "images/Video%20inicial.mp4",
    "images/como-pensamos.mp4",
    "images/territorio.webm",
    "images/territorio.mov",
  ];

  let started = false;
  let holdTime = null;
  let frozen = false;
  let observer = null;

  function setReplayVisible(visible) {
    if (!replayBtn) return;
    replayBtn.hidden = !visible;
  }

  function showPosterFallback() {
    figure.classList.add("no-video");
    figure.classList.remove("is-frozen");
    setReplayVisible(false);
    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  async function headOk(src) {
    try {
      const res = await fetch(src, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function resolveSrc() {
    for (const src of CANDIDATES) {
      if (await headOk(src)) return src;
    }
    return null;
  }

  function computeHoldTime() {
    const d = video.duration;
    if (!Number.isFinite(d) || d <= 0) return null;
    if (d > STOP_BEFORE_END_SEC + 0.3) {
      return Math.max(0, d - STOP_BEFORE_END_SEC);
    }
    return Math.max(0, d * 0.92);
  }

  function freezeAtHold() {
    if (frozen) return;
    frozen = true;
    if (holdTime == null) holdTime = computeHoldTime();

    const seekAndPause = () => {
      video.pause();
      if (holdTime != null && Number.isFinite(holdTime)) {
        try {
          if (Math.abs(video.currentTime - holdTime) > 0.08) {
            video.currentTime = holdTime;
            return;
          }
        } catch {
          /* buffering */
        }
      }
      figure.classList.add("is-frozen");
      setReplayVisible(true);
    };

    video.addEventListener("seeked", seekAndPause, { once: true });
    seekAndPause();
  }

  function replay() {
    frozen = false;
    figure.classList.remove("is-frozen", "is-hold");
    setReplayVisible(false);
    holdTime = computeHoldTime();
    video.currentTime = 0;
    video.playbackRate = PLAYBACK_RATE;
    video.play().catch(showPosterFallback);
  }

  function onTimeUpdate() {
    if (frozen) return;
    if (holdTime == null) holdTime = computeHoldTime();
    if (holdTime == null) return;
    if (video.currentTime >= holdTime - 0.04) {
      freezeAtHold();
    }
  }

  function bindPlayback() {
    video.loop = false;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.playbackRate = PLAYBACK_RATE;

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", freezeAtHold);
    video.addEventListener("loadedmetadata", () => {
      holdTime = computeHoldTime();
    });

    replayBtn?.addEventListener("click", replay);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      figure.classList.add("is-hold");
      video.pause();
      setReplayVisible(true);
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started) return;
          started = true;
          observer.disconnect();
          observer = null;

          video.preload = "auto";
          const playWhenReady = () => {
            video.playbackRate = PLAYBACK_RATE;
            video.play().catch(showPosterFallback);
          };

          if (video.readyState >= 2) {
            playWhenReady();
          } else {
            video.addEventListener("canplay", playWhenReady, { once: true });
          }
        });
      },
      { threshold: 0.2, rootMargin: "80px 0px" }
    );

    observer.observe(section);
  }

  async function init() {
    const src = await resolveSrc();
    if (!src) {
      showPosterFallback();
      return;
    }

    figure.classList.remove("no-video", "is-hold", "is-frozen");
    frozen = false;
    holdTime = null;
    setReplayVisible(false);
    video.src = src;
    video.load();
    bindPlayback();
  }

  init();
})();
