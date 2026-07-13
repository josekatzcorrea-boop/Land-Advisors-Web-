/**
 * Genera 5 carruseles Meta "sueño del sur" (antesala publicidad).
 * Slide 1 = solo foto + título + isotipo.
 */
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rrss = join(__dirname, "..");
const postsDir = join(rrss, "posts");
const cssSrc = join(rrss, "templates", "carousel-sueno.css");
const css = readFileSync(cssSrc, "utf8");

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

function slideCta({ n, total, title, body }) {
  return `<section class="slide slide--cta slide--cta-minimal" data-slide="${n}" aria-label="Slide ${n}">
      <div class="slide__inner">
        <img class="slide__isotipo-lg" src="${isoWhite}" alt="" width="140" height="140">
        <h2 class="slide__title slide__title--light slide__title--md">${title}</h2>
        <p class="slide__body slide__body--light" style="margin-top:20px;font-size:34px;">${body}</p>
        <span class="slide__btn">Agenda tu reunión estratégica</span>
        <p class="slide__url">landadvisors.cl</p>
      </div>
      <div class="slide__footer" style="position:absolute;left:72px;right:72px;bottom:72px;z-index:2;">
        <span class="slide__num slide__num--light">${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
      </div>
    </section>`;
}

const series = [
  {
    id: "2026-07-16-MS1",
    fecha: "2026-07-16",
    hora: "10:00",
    tema: "El sueño de una casa cerca de Puerto Varas",
    ig_prefix: "land-advisors-casa-puerto-varas",
    titulo_interno: "Meta sueño 1 — casa cerca de Puerto Varas",
    meta_primary:
      "Si en Santiago el tiempo no alcanza, imagina construir cerca de Puerto Varas: espacio, aire y un proyecto a tu ritmo. Te acompañamos a elegir el terreno correcto.",
    meta_headline: "El sueño de una casa cerca de Puerto Varas",
    caption_ig: `Muchos en Santiago llegan al mismo punto: menos tiempo, más estrés, y la sensación de que la casa ideal no está en la ciudad.

El sueño de una casa cerca de Puerto Varas no es escapismo — es un proyecto concreto. Espacio para vivir y construir con calma.

Enamorarse del lugar está bien. Después contrastamos zona, precio y viabilidad — de tu lado.

Desliza 👉

¿Ya miras terrenos en la cuenca o recién empiezas?

Agenda tu reunión estratégica — enlace en bio.

#LandAdvisors #PuertoVaras #SurDeChile #TerrenosChile #ContornoRural #CalidadDeVida`,
    caption_fb: `El sueño de una casa cerca de Puerto Varas — para quien busca más espacio y menos fricción que en Santiago.

Te acompañamos a elegir el terreno con criterio local.

https://www.landadvisors.cl/#contacto-form?utm_source=facebook&utm_medium=paid&utm_campaign=meta-sueno-casa-pv

#LandAdvisors #PuertoVaras #SurDeChile`,
    slides_html: (T) =>
      [
        slideTitleOnly({
          n: 1,
          total: T,
          title: "El sueño de una casa<br>cerca de Puerto Varas",
          img: f(3),
          objectPos: "center 42%",
        }),
        slidePhotoStory({
          n: 2,
          total: T,
          title: "Más espacio.<br>Menos fricción.",
          body: "Un terreno donde la casa encaja de verdad — con margen para crecer, recibir y respirar.",
          img: f(1),
          objectPos: "center 55%",
        }),
        slidePhotoStory({
          n: 3,
          total: T,
          title: "Un proyecto,<br>no solo una foto",
          body: "Familia, descanso o inversión: primero aclaramos qué quieres hacer. Después buscamos dónde tiene sentido.",
          img: f(7),
          objectPos: "center 48%",
        }),
        slidePhotoStory({
          n: 4,
          total: T,
          title: "Enamorarse está bien",
          body: "Si un terreno te enamora, lo validamos contigo: zona, precio y viabilidad. Sin sermón — con criterio local.",
          img: f(10),
          objectPos: "center 40%",
        }),
        slideCta({
          n: 5,
          total: T,
          title: "Empecemos por tu proyecto",
          body: "Cuéntanos cómo imaginas la casa cerca de Puerto Varas. Ordenamos zona y criterios juntos.",
        }),
      ].join("\n\n"),
  },
  {
    id: "2026-07-17-MS2",
    fecha: "2026-07-17",
    hora: "10:00",
    tema: "Un terreno entre árboles para desconectar",
    ig_prefix: "land-advisors-terreno-bosque",
    titulo_interno: "Meta sueño 2 — terreno entre árboles",
    meta_primary:
      "Cuando la ciudad satura, un terreno entre árboles en el sur deja de ser fantasía: es un lugar concreto para desconectar — y se elige con calma.",
    meta_headline: "Un terreno entre árboles para desconectar",
    caption_ig: `Hay semanas en Santiago que se sienten interminables.

Un terreno entre árboles en el sur no resuelve todo — pero sí cambia el ritmo: sombra, silencio y un lugar al que volver.

No hace falta apagar el sueño para decidir bien. Solo hace falta leer el territorio contigo.

Desliza 👉

¿Buscas bosque, lago o contorno rural cerca de ciudad?

Agenda tu reunión estratégica — enlace en bio.

#LandAdvisors #SurDeChile #Malalcahuello #TerrenosChile #PuertoVaras`,
    caption_fb: `Un terreno entre árboles para desconectar — el contraste que muchos buscan cuando viven en Santiago.

Te ayudamos a encontrar el lugar y a validar que realmente calza.

https://www.landadvisors.cl/#contacto-form?utm_source=facebook&utm_medium=paid&utm_campaign=meta-sueno-bosque

#LandAdvisors #SurDeChile #TerrenosChile`,
    slides_html: (T) =>
      [
        slideTitleOnly({
          n: 1,
          total: T,
          title: "Un terreno entre árboles<br>para desconectar",
          img: f(13),
          objectPos: "center 48%",
        }),
        slidePhotoStory({
          n: 2,
          total: T,
          title: "Menos ruido.<br>Más presencia.",
          body: "El bosque no es decorado: es el contraste que buscas cuando la ciudad satura.",
          img: f(16),
          objectPos: "center 42%",
        }),
        slidePhotoStory({
          n: 3,
          total: T,
          title: "De visita a estilo de vida",
          body: "Un fin de semana que se vuelve hábito — o el lugar al que siempre regresas.",
          img: f(11),
          objectPos: "center 40%",
        }),
        slidePhotoStory({
          n: 4,
          total: T,
          title: "El bosque también se elige con criterio",
          body: "Acceso, agua, pendiente y vecinos importan. Te ayudamos a mirar eso sin perder lo que te atrajo del lugar.",
          img: f(17),
          objectPos: "center 45%",
        }),
        slideCta({
          n: 5,
          total: T,
          title: "Busquemos tu terreno",
          body: "Si el bosque es tu paisaje, partamos por zonas que tengan sentido para ti.",
        }),
      ].join("\n\n"),
  },
  {
    id: "2026-07-18-MS3",
    fecha: "2026-07-18",
    hora: "10:00",
    tema: "Calidad de vida, a horas de Santiago",
    ig_prefix: "land-advisors-calidad-vida-santiago",
    titulo_interno: "Meta sueño 3 — calidad de vida desde Santiago",
    meta_primary:
      "Calidad de vida, a horas de Santiago: lago, contorno rural y un terreno con sentido. No es escapar — es decidir cómo quieres vivir.",
    meta_headline: "Calidad de vida, a horas de Santiago",
    caption_ig: `Si vives en Santiago y sientes que el tiempo se te va en tránsito y estrés, el sur no es solo vacaciones.

Calidad de vida, a horas de Santiago: Puerto Varas, Frutillar, Llanquihue — contorno rural con servicios cerca y espacio de verdad.

Te ayudamos a aterrizar el sueño con mapa local, antes del próximo viaje.

Desliza 👉

¿Vienes por vivir, invertir… o las dos?

Agenda tu reunión estratégica — enlace en bio.

#LandAdvisors #PuertoVaras #Frutillar #Llanquihue #SurDeChile #TerrenosChile`,
    caption_fb: `Calidad de vida, a horas de Santiago — y un terreno elegido con criterio en la cuenca del Lago Llanquihue.

Reunión estratégica online o en Puerto Varas.

https://www.landadvisors.cl/#contacto-form?utm_source=facebook&utm_medium=paid&utm_campaign=meta-sueno-calidad-vida

#LandAdvisors #SurDeChile #PuertoVaras`,
    slides_html: (T) =>
      [
        slideTitleOnly({
          n: 1,
          total: T,
          title: "Calidad de vida,<br>a horas de Santiago",
          img: f(9),
          objectPos: "center 40%",
        }),
        slidePhotoStory({
          n: 2,
          total: T,
          title: "La cuenca del Llanquihue",
          body: "No se entiende solo en pantallas: se recorre. Cada comuna tiene otro ritmo y otra lógica de precios.",
          img: f(5),
          objectPos: "center 38%",
        }),
        slidePhotoStory({
          n: 3,
          total: T,
          title: "Cerca de la ciudad,<br>con aire de campo",
          body: "El contorno rural: servicios a mano y espacio real. Ahí suele estar el equilibrio que buscan desde Santiago.",
          img: f(18),
          objectPos: "center 45%",
        }),
        slidePhotoStory({
          n: 4,
          total: T,
          title: "El sur se entiende mejor con guía local",
          body: "Muchos clientes viven lejos y compran aquí. Te armamos criterio antes del viaje — para que cada visita cuente.",
          img: f(6),
          objectPos: "center 40%",
        }),
        slideCta({
          n: 5,
          total: T,
          title: "Ordenemos tu búsqueda",
          body: "Cuéntanos qué buscas. Te proponemos zonas y un camino claro.",
        }),
      ].join("\n\n"),
  },
  {
    id: "2026-07-19-MS4",
    fecha: "2026-07-19",
    hora: "10:00",
    tema: "Tener terreno propio en el sur",
    ig_prefix: "land-advisors-terreno-propio",
    titulo_interno: "Meta sueño 4 — terreno propio en el sur",
    meta_primary:
      "Tener terreno propio en el sur no es un eslogan: es el día en que llegas y sabes que el lugar calza. Te acompañamos hasta esa certeza.",
    meta_headline: "Tener terreno propio en el sur",
    caption_ig: `Tener terreno propio en el sur.

Ese momento en que llegas, miras alrededor y se te ordena la cabeza — no es casualidad. Es buscar con emoción y decidir con criterio.

No vendemos terrenos. Te acompañamos a comprar el correcto.

Desliza 👉

¿Ya viste alguno que te enamoró? Escríbenos.

Agenda tu reunión estratégica — enlace en bio.

#LandAdvisors #TerrenosChile #SurDeChile #PuertoVaras #ComprarTerreno`,
    caption_fb: `Tener terreno propio en el sur — con alguien de tu lado en la decisión.

https://www.landadvisors.cl/#contacto-form?utm_source=facebook&utm_medium=paid&utm_campaign=meta-sueno-terreno-propio

#LandAdvisors #TerrenosChile #SurDeChile`,
    slides_html: (T) =>
      [
        slideTitleOnly({
          n: 1,
          total: T,
          title: "Tener terreno propio<br>en el sur",
          img: f(14),
          objectPos: "center 48%",
        }),
        slidePhotoStory({
          n: 2,
          total: T,
          title: "Cuando el lugar calza",
          body: "No es solo emoción: es la certeza de haber encontrado algo que sostiene tu proyecto.",
          img: f(1),
          objectPos: "center 55%",
        }),
        slidePhotoStory({
          n: 3,
          total: T,
          title: "Solo, en pareja<br>o en familia",
          body: "El terreno se siente distinto cuando es el correcto — y cuando alguien te ayudó a contrastarlo.",
          img: f(9),
          objectPos: "center 50%",
        }),
        slidePhotoStory({
          n: 4,
          total: T,
          title: "De tu lado en la decisión",
          body: "Filtramos alternativas, comparamos las mejores contigo y te decimos con honestidad si conviene seguir buscando.",
          img: f(8),
          objectPos: "center 45%",
        }),
        slideCta({
          n: 5,
          total: T,
          title: "Encontremos el tuyo",
          body: "Si ya tienes un terreno en la mira — o aún no — partamos juntos.",
        }),
      ].join("\n\n"),
  },
  {
    id: "2026-07-20-MS5",
    fecha: "2026-07-20",
    hora: "10:00",
    tema: "Despertar lejos del ritmo de Santiago",
    ig_prefix: "land-advisors-despertar-lago",
    titulo_interno: "Meta sueño 5 — despertar lejos del ritmo de Santiago",
    meta_primary:
      "Despertar lejos del ritmo de Santiago: lago cerca, menos ruido, más margen. El terreno correcto hace que la mañana se sienta distinta.",
    meta_headline: "Despertar lejos del ritmo de Santiago",
    caption_ig: `Despertar lejos del ritmo de Santiago.

Café, silencio, luz del sur. No es una fantasía de Instagram: es lo que mucha gente viene a buscar al contorno rural de la cuenca del Llanquihue.

Enamorarse del paisaje está bien. Nosotros te ayudamos a que el terreno detrás de esa mañana también sea el correcto.

Desliza 👉

Guárdalo si estás evaluando comprar en el sur.

Agenda tu reunión estratégica — enlace en bio.

#LandAdvisors #LagoLlanquihue #PuertoVaras #SurDeChile #TerrenosChile #CalidadDeVida`,
    caption_fb: `Despertar lejos del ritmo de Santiago — con un terreno en la cuenca del Llanquihue elegido con sentido.

https://www.landadvisors.cl/#contacto-form?utm_source=facebook&utm_medium=paid&utm_campaign=meta-sueno-lago

#LandAdvisors #LagoLlanquihue #SurDeChile`,
    slides_html: (T) =>
      [
        slideTitleOnly({
          n: 1,
          total: T,
          title: "Despertar lejos del<br>ritmo de Santiago",
          img: f(5),
          objectPos: "center 35%",
        }),
        slidePhotoStory({
          n: 2,
          total: T,
          title: "La mañana que buscas",
          body: "No hace falta vivir en la orilla: hace falta un terreno con la distancia y el acceso correctos.",
          img: f(2),
          objectPos: "center 40%",
        }),
        slidePhotoStory({
          n: 3,
          total: T,
          title: "El paisaje que sostiene<br>el día a día",
          body: "La postal existe. La pregunta es qué zona la sostiene fuera de la foto del aviso.",
          img: f(13),
          objectPos: "center 42%",
        }),
        slidePhotoStory({
          n: 4,
          total: T,
          title: "La foto abre la visita",
          body: "Recorrer terrenos es parte natural del proceso. Te preparamos para que cada visita acerque la decisión — no solo la emoción.",
          img: f(12),
          objectPos: "center 42%",
        }),
        slideCta({
          n: 5,
          total: T,
          title: "Diseñemos tu búsqueda",
          body: "Cuéntanos qué buscas cerca del lago. Te proponemos un mapa claro.",
        }),
      ].join("\n\n"),
  },
];

const TOTAL = 5;

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
    <span>Meta sueño · ${TOTAL} slides · título solo en 01</span>
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

  const json = {
    id: post.id,
    fecha_publicacion: post.fecha,
    hora: post.hora,
    zona_horaria: "America/Santiago",
    pilar: "META-SUEÑO",
    campana: "meta-antesala-publicidad",
    tema: post.tema,
    formato: "carrusel",
    slides_count: TOTAL,
    redes: ["instagram", "facebook", "meta_ads"],
    cta: "reunion_estrategica",
    disclaimer: false,
    estado: "listo_publicar",
    post_generado: `rrss/posts/${post.id}.json`,
    piezas_visuales: `rrss/posts/${post.id}/index.html`,
    export_output: `rrss/output/${post.id}/`,
    titulo_interno: post.titulo_interno,
    caption_ig: post.caption_ig,
    caption_fb: post.caption_fb,
    meta_primary_text: post.meta_primary,
    meta_headline: post.meta_headline,
    meta_description: "Consultoría territorial en el sur de Chile. De tu lado para comprar el terreno correcto.",
    cta_texto: "Agenda tu reunión estratégica",
    cta_url: `https://www.landadvisors.cl/#contacto-form?utm_source=meta&utm_medium=paid&utm_campaign=${post.ig_prefix}`,
    notas_diseno: {
      formato: "1080×1350 vertical",
      instagram_prefix: post.ig_prefix,
      layouts: "photo-title · photo-story · photo-story · light · cta-minimal",
      slide1: "Solo imagen + título + isotipo (sin texto explicativo)",
      fotos: "Clientes reales — rrss/assets/fotos-clientes/",
    },
  };

  writeFileSync(join(postsDir, `${post.id}.json`), JSON.stringify(json, null, 2), "utf8");
  console.log("wrote", post.id);
}

const guide = `# Meta — Serie “Sueño del sur” (antesala publicidad)

5 carruseles listos para programar en Meta (IG / FB / Ads).
Formato: **1080×1350** · 5 slides · slide 1 = solo foto + título + isotipo.

## Publicaciones

| ID | Tema | Carpeta PNG |
|----|------|-------------|
| 2026-07-16-MS1 | Tu casa en la pradera | \`rrss/output/2026-07-16-MS1/instagram/\` |
| 2026-07-17-MS2 | Un refugio entre árboles | \`rrss/output/2026-07-17-MS2/instagram/\` |
| 2026-07-18-MS3 | Así se siente el sur | \`rrss/output/2026-07-18-MS3/instagram/\` |
| 2026-07-19-MS4 | Tu terreno. Tu ritmo. | \`rrss/output/2026-07-19-MS4/instagram/\` |
| 2026-07-20-MS5 | Despertar con el lago cerca | \`rrss/output/2026-07-20-MS5/instagram/\` |

## Cómo publicar / pautar

1. Sube los PNG en orden (\`-01\` … \`-05\`).
2. Copia \`caption_ig\` / \`caption_fb\` / \`meta_primary_text\` desde el JSON de cada post.
3. CTA: reunión estratégica → landadvisors.cl (UTM ya en cada JSON).
4. Tono: sueño primero, criterio después — **no** sermón.

## Exportar de nuevo

\`\`\`powershell
cd rrss/scripts
.\\export-carousel.ps1 -PostId 2026-07-16-MS1 -SlideCount 5 -IgPrefix land-advisors-casa-pradera
\`\`\`

Copys completos: cada \`rrss/posts/2026-07-*-MS*.json\`.
`;

writeFileSync(join(rrss, "META-serie-sueno-antesala.md"), guide, "utf8");
console.log("guide ok");
