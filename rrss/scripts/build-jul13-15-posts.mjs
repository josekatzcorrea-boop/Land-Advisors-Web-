/**
 * Regenera T3, M2, E3 (3 posts previos a serie MS) con estilo carrusel sueño.
 * Slide 1 = foto + título + isotipo · fotos clientes · carousel-sueno.css
 */
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rrss = join(__dirname, "..");
const postsDir = join(rrss, "posts");
const cssSrc = join(rrss, "templates", "carousel-sueno.css");

const isoWhite = "/brochure/assets/isotipo-3d-blanco-transparente.png";
const isoBlue = "/assets/logo-isotipo-3d-transparente.png";
const f = (n) => `/rrss/assets/fotos-clientes/cliente-${String(n).padStart(2, "0")}.jpg`;

function footer(num, total, light = true) {
  const nClass = light ? "slide__num slide__num--light" : "slide__num";
  const iso = light ? isoWhite : isoBlue;
  return `<div class="slide__footer" style="position:absolute;left:72px;right:72px;bottom:56px;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:0;">
        <span class="${nClass}">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
        <div class="slide__brand-mini">
          <img src="${iso}" alt="" width="52" height="52">
        </div>
      </div>`;
}

function slideTitleOnly({ n, total, title, img, objectPos = "center 45%" }) {
  return `<section class="slide slide--photo slide--photo-title" data-slide="${n}" aria-label="Slide ${n}">
      <div class="slide__bg">
        <img src="${img}" alt="" width="1080" height="1350" style="object-position:${objectPos}">
      </div>
      <div class="slide__overlay"></div>
      <div class="slide__inner">
        <h1 class="slide__title slide__title--light">${title}</h1>
      </div>
      ${footer(n, total, true)}
    </section>`;
}

function slidePhotoStory({ n, total, title, body, img, objectPos = "center 50%" }) {
  return `<section class="slide slide--photo slide--photo-story" data-slide="${n}" aria-label="Slide ${n}">
      <div class="slide__bg">
        <img src="${img}" alt="" width="1080" height="1350" style="object-position:${objectPos}">
      </div>
      <div class="slide__overlay"></div>
      <div class="slide__inner">
        <h2 class="slide__title slide__title--light">${title}</h2>
        <p class="slide__body slide__body--light">${body}</p>
      </div>
      ${footer(n, total, true)}
    </section>`;
}

function slideLight({ n, total, badge, title, body }) {
  return `<section class="slide slide--light" data-slide="${n}" aria-label="Slide ${n}">
      <div class="slide__inner" style="padding-bottom:48px;">
        <span class="slide__badge">${badge}</span>
        <h2 class="slide__title slide__title--sm">${title}</h2>
        <p class="slide__body">${body}</p>
      </div>
      ${footer(n, total, false)}
    </section>`;
}

function slideCta({ n, total, title, body, disclaimer = "" }) {
  const disc = disclaimer
    ? `<p class="slide__disclaimer" style="color:rgba(255,255,255,0.75);margin-top:24px;">${disclaimer}</p>`
    : "";
  return `<section class="slide slide--cta slide--cta-minimal" data-slide="${n}" aria-label="Slide ${n}">
      <div class="slide__inner">
        <img class="slide__isotipo-lg" src="${isoWhite}" alt="" width="140" height="140">
        <h2 class="slide__title slide__title--light slide__title--md">${title}</h2>
        <p class="slide__body slide__body--light" style="margin-top:20px;font-size:34px;">${body}</p>
        <span class="slide__btn">Agenda tu reunión estratégica</span>
        ${disc}
        <p class="slide__url">landadvisors.cl</p>
      </div>
      <div class="slide__footer" style="position:absolute;left:72px;right:72px;bottom:72px;z-index:2;">
        <span class="slide__num slide__num--light">${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
      </div>
    </section>`;
}

const series = [
  {
    id: "2026-07-13-T3",
    fecha: "2026-07-13",
    hora: "10:00",
    pilar: "T",
    tema: "¿Dónde tiene horizonte tu proyecto? Puerto Varas, Frutillar o Llanquihue",
    ig_prefix: "land-advisors-territorio-futuro",
    titulo_interno: "Territorio — horizonte · estilo sueño",
    caption_ig: `Elegir terreno en el sur no es solo responder a una vista bonita.

Conviene preguntarse si ese rincón puede sostener tu proyecto en el tiempo: cómo crece la ciudad, qué pasa con caminos y servicios, y qué ritmo de vida ofrece cada comuna.

Desliza 👉

¿En qué zona imaginas tu proyecto hoy?

Agenda tu reunión estratégica — enlace en bio.

#LandAdvisors #TerrenosChile #SurDeChile #PuertoVaras #Frutillar #Llanquihue #ContornoRural`,
    caption_fb: `¿Dónde tiene horizonte tu proyecto en Puerto Varas, Frutillar o Llanquihue?

https://www.landadvisors.cl/#contacto-form?utm_source=facebook&utm_medium=social&utm_campaign=rrss-territorio-jul2026

#LandAdvisors #SurDeChile #TerrenosChile`,
    slides_html: (T) =>
      [
        slideTitleOnly({
          n: 1,
          total: T,
          title: "¿Dónde tiene horizonte<br>tu proyecto?",
          img: f(4),
          objectPos: "center 42%",
        }),
        slidePhotoStory({
          n: 2,
          total: T,
          title: "Tres comunas,<br>un mismo lago",
          body: "Puerto Varas, Frutillar y Llanquihue conectan ciudad, lago y contorno rural de formas distintas. Elegir comuna es elegir estilo de vida.",
          img: f(5),
          objectPos: "center 38%",
        }),
        slidePhotoStory({
          n: 3,
          total: T,
          title: "La periferia<br>también evoluciona",
          body: "Lo que hoy parece lejos puede cambiar con nuevas vías, servicios y demanda por contorno. Vale la pena mirar hacia adelante.",
          img: f(6),
          objectPos: "center 45%",
        }),
        slidePhotoStory({
          n: 4,
          total: T,
          title: "Más allá<br>del paisaje",
          body: "Conectividad, agua, electricidad, comercio y distancia real a la ciudad. Variables que definen si un lugar funciona cuando el asunto deja de ser solo la vista.",
          img: f(8),
          objectPos: "center 48%",
        }),
        slideLight({
          n: 5,
          total: T,
          badge: "De tu lado",
          title: "Territorio antes del precio",
          body: "Recorremos Puerto Varas, Frutillar y Llanquihue para orientar la búsqueda: dónde tu proyecto tiene sentido hoy y hacia dónde puede mirar el entorno mañana.",
        }),
        slideCta({
          n: 6,
          total: T,
          title: "Vista + futuro = mejor decisión",
          body: "Conectar con un lugar es legítimo. Entender su evolución es lo que convierte esa preferencia en una elección duradera.",
        }),
      ].join("\n\n"),
  },
  {
    id: "2026-07-14-M2",
    fecha: "2026-07-14",
    hora: "12:00",
    pilar: "M",
    tema: "Cinco preguntas útiles en la visita al terreno",
    ig_prefix: "land-advisors-preguntas-visita",
    titulo_interno: "Metodología — preguntas visita · estilo sueño",
    caption_ig: `Recorrer terrenos en el sur es parte natural de comprar. Una buena impresión en sitio no basta para firmar.

Cinco preguntas simples — invierno, precio, proyecto, entorno y reflexión al día siguiente — ayudan a decidir con más sustancia.

Desliza 👉

¿Cuál te cuesta más hacer cuando visitas un terreno?

Agenda tu reunión estratégica — enlace en bio.

#LandAdvisors #TerrenosChile #SurDeChile #PuertoVaras #ContornoRural #Metodología`,
    caption_fb: `Cinco preguntas para una visita a terreno en el sur — metodología Land Advisors.

https://www.landadvisors.cl/#contacto-form?utm_source=facebook&utm_medium=social&utm_campaign=rrss-visita-jul2026

#LandAdvisors #SurDeChile #TerrenosChile`,
    slides_html: (T) =>
      [
        slideTitleOnly({
          n: 1,
          total: T,
          title: "Cinco preguntas<br>en terreno",
          img: f(15),
          objectPos: "center 48%",
        }),
        slidePhotoStory({
          n: 2,
          total: T,
          title: "¿Llegarías igual<br>en invierno?",
          body: "Sol y camino seco cuentan una historia. Lluvia, barro y menos luz cuentan otra. Vale imaginar el lugar en el día difícil, no solo en el de la visita.",
          img: f(12),
          objectPos: "center 42%",
        }),
        slidePhotoStory({
          n: 3,
          total: T,
          title: "¿El precio tiene<br>referencia en la zona?",
          body: "Comparar con terrenos similares cercanos no es regateo por deporte: es saber si pagas la vista, el acceso o un valor fuera de mercado.",
          img: f(2),
          objectPos: "center 40%",
        }),
        slideLight({
          n: 4,
          total: T,
          badge: "Pregunta 3",
          title: "¿Tu proyecto encaja aquí?",
          body: "Casa, cabañas o negocio no pesan igual. Revisa qué permite el terreno y el reglamento del loteo antes de asumir que todo es posible.",
        }),
        slidePhotoStory({
          n: 5,
          total: T,
          title: "Antes de subir<br>al auto",
          body: "¿Cómo es el acceso y el entorno? ¿Seguirías interesado al día siguiente, sabiendo lo que viste hoy? Dos preguntas que ordenan la emoción.",
          img: f(14),
          objectPos: "center 45%",
        }),
        slideCta({
          n: 6,
          total: T,
          title: "Curiosidad con método",
          body: "Las preguntas no apagan nada: ordenan. Así puedes quedarte con un terreno que conserve lo que te atrajo y que además resista el análisis.",
        }),
      ].join("\n\n"),
  },
  {
    id: "2026-07-15-E3",
    fecha: "2026-07-15",
    hora: "10:00",
    pilar: "E",
    tema: "¿Ya tienes un terreno en mente? Afina antes de ofertar",
    ig_prefix: "land-advisors-afinar-eleccion",
    titulo_interno: "Educación — afinar elección · estilo sueño",
    disclaimer: true,
    caption_ig: `¿Encontraste un terreno que te convence después de la visita?

Es un buen momento para pausar y contrastar: precio frente al mercado local, acceso real, reglamento y si tu proyecto encaja en el lote.

Si resiste el análisis, avanzas con más respaldo. Si no, se puede seguir buscando hasta una alternativa sólida.

Desliza el carrusel 👉

Contenido educativo. Cada terreno requiere evaluación específica según normativa vigente.

Agenda tu reunión estratégica — enlace en bio.

#LandAdvisors #TerrenosChile #SurDeChile #PuertoVaras #ContornoRural #EducaciónInmobiliaria`,
    caption_fb: `¿Ya tienes un terreno en mente? Cómo afinar la elección antes de ofertar.

Contenido educativo. Cada terreno requiere evaluación específica.

https://www.landadvisors.cl/#contacto-form?utm_source=facebook&utm_medium=social&utm_campaign=rrss-afinar-jul2026

#LandAdvisors #SurDeChile #TerrenosChile`,
    slides_html: (T) =>
      [
        slideTitleOnly({
          n: 1,
          total: T,
          title: "¿Ya tienes uno<br>en mente?",
          img: f(7),
          objectPos: "center 48%",
        }),
        slidePhotoStory({
          n: 2,
          total: T,
          title: "Anota qué<br>te convenció",
          body: "Vista, silencio, distancia a la ciudad, tamaño del lote. Ponerlo por escrito ayuda a buscar lo mismo en otras opciones si este terreno no resiste el análisis.",
          img: f(10),
          objectPos: "center 40%",
        }),
        slidePhotoStory({
          n: 3,
          total: T,
          title: "¿El precio calza<br>con el mercado local?",
          body: "Dos o tres referencias cercanas suelen bastar para saber si el valor pedido tiene sustento o si estás pagando solo la foto del aviso.",
          img: f(3),
          objectPos: "center 42%",
        }),
        slideLight({
          n: 4,
          total: T,
          badge: "Paso 3",
          title: "¿El día a día funciona aquí?",
          body: "Acceso todo el año, agua, electricidad, reglamento del loteo y servicios a mano. Lo que se ve un día soleado puede sentirse distinto cuando el camino es barro.",
        }),
        slidePhotoStory({
          n: 5,
          total: T,
          title: "Si no encaja,<br>seguimos",
          body: "Decir que un terreno no es la alternativa correcta no quita valor al proceso: cuida tu inversión. Hay más oferta — y podemos seguir buscando contigo.",
          img: f(17),
          objectPos: "center 45%",
        }),
        slideCta({
          n: 6,
          total: T,
          title: "Preferencia + contraste",
          body: "Si el terreno resiste el análisis, avanzas con más seguridad. Si no, afinamos hasta una opción sólida que conserve lo que te atrajo.",
          disclaimer:
            "Contenido educativo. Cada terreno requiere evaluación específica según normativa vigente.",
        }),
      ].join("\n\n"),
  },
];

const TOTAL = 6;

for (const post of series) {
  const dir = join(postsDir, post.id);
  mkdirSync(dir, { recursive: true });
  copyFileSync(cssSrc, join(dir, "carousel.css"));

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.id} — ${post.tema}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=block" rel="stylesheet">
  <link rel="stylesheet" href="/rrss/posts/${post.id}/carousel.css">
</head>
<body>
  <header class="carousel-toolbar">
    <strong>${post.id}</strong>
    <span>Estilo sueño · ${TOTAL} slides · título solo en 01</span>
    <button type="button" id="btn-export-hint">Exportar: scripts/export-carousel.ps1</button>
  </header>

  <main class="carousel-deck" id="carousel-deck">

${post.slides_html(TOTAL)}

  </main>

  <script>
    if (location.search.includes("export=1")) {
      document.body.classList.add("export-mode");
    }
  </script>
</body>
</html>
`;

  writeFileSync(join(dir, "index.html"), html, "utf8");

  const existing = JSON.parse(readFileSync(join(postsDir, `${post.id}.json`), "utf8"));
  const json = {
    ...existing,
    piezas_visuales: `rrss/posts/${post.id}/index.html`,
    titulo_interno: post.titulo_interno,
    caption_ig: post.caption_ig,
    caption_fb: post.caption_fb,
    notas_diseno: {
      formato: "1080×1350 vertical",
      instagram_prefix: post.ig_prefix,
      layouts: "photo-title · photo-story · photo-story · light · photo-story · cta-minimal",
      slide1: "Solo imagen + título + isotipo (sin texto explicativo)",
      fotos: "Clientes reales — rrss/assets/fotos-clientes/",
      estilo: "carousel-sueno (serie MS)",
    },
  };

  writeFileSync(join(postsDir, `${post.id}.json`), JSON.stringify(json, null, 2), "utf8");
  console.log("wrote", post.id);
}
