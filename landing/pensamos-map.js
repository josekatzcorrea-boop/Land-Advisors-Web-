(function () {
  const container = document.getElementById("territorio-map");
  const fallback = document.getElementById("territorio-map-fallback");
  const figure = document.querySelector(".section-media-map");
  if (!container) return;

  const ANIMATION_MS = 6000;
  const FINAL_CAMERA = {
    lat: -41.32,
    lng: -72.94,
    zoom: 10.2,
    tilt: 42,
    heading: 32,
  };

  const FLIGHT_PATH = [
    { lat: 20, lng: -45, zoom: 2, tilt: 0, heading: 0 },
    { lat: -5, lng: -58, zoom: 3.2, tilt: 0, heading: 0 },
    { lat: -28, lng: -68, zoom: 5.5, tilt: 12, heading: 10 },
    { lat: -38, lng: -72, zoom: 8, tilt: 28, heading: 22 },
    FINAL_CAMERA,
  ];

  let map = null;
  let started = false;
  let finished = false;

  function useFallback() {
    if (figure) figure.classList.add("no-map");
    container.remove();
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpAngle(a, b, t) {
    let d = b - a;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return a + d * t;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function samplePath(path, progress) {
    const segments = path.length - 1;
    const scaled = progress * segments;
    const idx = Math.min(segments - 1, Math.floor(scaled));
    const local = scaled - idx;
    const a = path[idx];
    const b = path[idx + 1];
    const t = easeInOutCubic(local);
    return {
      lat: lerp(a.lat, b.lat, t),
      lng: lerp(a.lng, b.lng, t),
      zoom: lerp(a.zoom, b.zoom, t),
      tilt: lerp(a.tilt, b.tilt, t),
      heading: lerpAngle(a.heading, b.heading, t),
    };
  }

  function applyCamera(camera) {
    map.moveCamera({
      center: { lat: camera.lat, lng: camera.lng },
      zoom: camera.zoom,
      tilt: camera.tilt,
      heading: camera.heading,
    });
  }

  function runFlyAnimation(onDone) {
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / ANIMATION_MS);
      applyCamera(samplePath(FLIGHT_PATH, progress));

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        applyCamera(FINAL_CAMERA);
        onDone();
      }
    }

    requestAnimationFrame(frame);
  }

  function enableInteraction() {
    map.setOptions({
      gestureHandling: "greedy",
      zoomControl: true,
      rotateControl: true,
      scrollwheel: true,
      disableDoubleClickZoom: false,
      draggable: true,
    });
    if (figure) figure.classList.add("is-map-ready");
  }

  function initMap() {
    if (fallback) fallback.style.display = "none";

    map = new google.maps.Map(container, {
      center: { lat: FLIGHT_PATH[0].lat, lng: FLIGHT_PATH[0].lng },
      zoom: FLIGHT_PATH[0].zoom,
      tilt: 0,
      heading: 0,
      mapTypeId: "hybrid",
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      rotateControl: false,
      scaleControl: false,
      gestureHandling: "none",
      keyboardShortcuts: false,
      clickableIcons: false,
      isFractionalZoomEnabled: true,
    });

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      applyCamera(FINAL_CAMERA);
      enableInteraction();
      finished = true;
      return;
    }

    runFlyAnimation(() => {
      finished = true;
      enableInteraction();
    });
  }

  window.initTerritorioMap = initMap;

  function boot() {
    const key = (window.GOOGLE_MAPS_API_KEY || "").trim();
    if (!key) {
      useFallback();
      return;
    }

    const section = document.getElementById("pensamos");
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started) return;
          started = true;
          observer.disconnect();

          const script = document.createElement("script");
          script.src =
            "https://maps.googleapis.com/maps/api/js?key=" +
            encodeURIComponent(key) +
            "&v=weekly&callback=initTerritorioMap";
          script.async = true;
          script.defer = true;
          script.onerror = useFallback;
          document.head.appendChild(script);
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
  }

  boot();
})();
