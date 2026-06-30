#!/usr/bin/env node
/**
 * Genera calendario JSON + ICS para LinkedIn (90 días · empresa + personal).
 * Uso:
 *   node rrss/linkedin/scripts/generate-linkedin-calendar.mjs
 *   node rrss/linkedin/scripts/generate-linkedin-calendar.mjs --from=2026-06-17
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const linkedinDir = path.join(__dirname, '..');
const rrssDir = path.join(linkedinDir, '..');

const TZ = 'America/Santiago';
const START = '2026-06-16';
const END = '2026-09-13';

const fromArg = process.argv.find((a) => a.startsWith('--from='));
const cutoff = fromArg ? fromArg.replace('--from=', '') : `${new Date().toISOString().slice(0, 10)}T00:00:00`;

/** Semanas 1–13: temas desde LINKEDIN-estrategia-2026.md */
const WEEKS = [
  {
    fase: 1,
    rector: 'Arranque dual + posicionamiento',
    empresa: [
      { tema: 'Presentación consultoría Land Advisors', formato: 'carrusel', pilar: 'A' },
      { tema: 'Metodología — territorio primero, activo después', formato: 'carrusel', pilar: 'M' },
      { tema: 'Servicio spotlight — diagnóstico estratégico', formato: 'carrusel', pilar: 'S' },
    ],
    personal: [
      { tema: 'Lanzamiento LinkedIn — carta del fundador', formato: 'texto', pilar: 'A' },
      { tema: 'Por qué no somos corredora', formato: 'carrusel', pilar: 'M' },
      { tema: '3 errores al comprar terreno en el sur', formato: 'carrusel', pilar: 'E' },
      { tema: 'Video Ensenada — señales territoriales en 60 s', formato: 'video', pilar: 'T' },
    ],
  },
  {
    fase: 1,
    rector: 'Territorio + credibilidad',
    empresa: [
      { tema: 'Mapa cuenca Lago Llanquihue', formato: 'carrusel', pilar: 'T' },
      { tema: 'Camino del cliente Land Advisors', formato: 'carrusel', pilar: 'S' },
      { tema: 'Caso agregado brochure (credibilidad)', formato: 'carrusel', pilar: 'A' },
    ],
    personal: [
      { tema: '10 años leyendo el sur de Chile', formato: 'texto', pilar: 'A' },
      { tema: 'Opinión: portales vs consultoría', formato: 'texto', pilar: 'M' },
      { tema: 'Carrusel PRC Puerto Varas', formato: 'carrusel', pilar: 'E' },
      { tema: 'Pregunta abierta a la audiencia', formato: 'encuesta', pilar: 'A' },
    ],
  },
  {
    fase: 1,
    rector: 'Educación + primer partner',
    empresa: [
      { tema: 'Educación: OGUC rural', formato: 'carrusel', pilar: 'E' },
      { tema: 'Servicio búsqueda personalizada', formato: 'carrusel', pilar: 'S' },
      { tema: 'Partner Iterrasur — intro', formato: 'carrusel', pilar: 'P' },
    ],
    personal: [
      { tema: 'Video terreno: señales visibles', formato: 'video', pilar: 'T' },
      { tema: 'Cuándo NO comprar (confianza intelectual)', formato: 'texto', pilar: 'M' },
      { tema: 'Carrusel plusvalía contorno rural', formato: 'carrusel', pilar: 'T' },
      { tema: 'Comentario tendencia mercado', formato: 'texto', pilar: 'T' },
    ],
  },
  {
    fase: 1,
    rector: 'Conversión suave',
    empresa: [
      { tema: 'Carrusel 5 servicios en UF', formato: 'carrusel', pilar: 'S' },
      { tema: 'Caso Llanquihue (anonimizado)', formato: 'carrusel', pilar: 'S' },
      { tema: 'CTA diagnóstico Q2', formato: 'carrusel', pilar: 'S' },
    ],
    personal: [
      { tema: 'Artículo: decisión inmobiliaria empieza antes del terreno', formato: 'articulo', pilar: 'E' },
      { tema: 'Mini caso Frutillar', formato: 'texto', pilar: 'S' },
      { tema: 'Video acceso y conectividad', formato: 'video', pilar: 'T' },
      { tema: 'Encuesta: ¿qué te frena al comprar?', formato: 'encuesta', pilar: 'E' },
    ],
  },
  {
    fase: 2,
    rector: 'Expansión territorial',
    empresa: [
      { tema: 'Mapa sectores valorización', formato: 'carrusel', pilar: 'T' },
      { tema: 'Tiny houses: marco conceptual', formato: 'carrusel', pilar: 'TH' },
      { tema: 'Documento checklist compra (lead magnet)', formato: 'documento', pilar: 'E' },
    ],
    personal: [
      { tema: 'Puerto Octay: oportunidades', formato: 'texto', pilar: 'T' },
      { tema: 'Normativa agrícola explicada', formato: 'carrusel', pilar: 'E' },
      { tema: 'Video camino vs ubicación', formato: 'video', pilar: 'T' },
      { tema: 'Historia cliente anonimizada', formato: 'texto', pilar: 'S' },
    ],
  },
  {
    fase: 2,
    rector: 'Consideración profunda',
    empresa: [
      { tema: 'Servicio evaluación técnica', formato: 'carrusel', pilar: 'S' },
      { tema: 'Caso desarrollador PYME', formato: 'carrusel', pilar: 'S' },
      { tema: 'Alianza arquitecto (colaboración)', formato: 'carrusel', pilar: 'P' },
    ],
    personal: [
      { tema: 'Las Cascadas: tesis inversión', formato: 'texto', pilar: 'T' },
      { tema: 'Renta corta: expectativas reales', formato: 'texto', pilar: 'ST' },
      { tema: 'Carrusel 7 preguntas antes de ofertar', formato: 'carrusel', pilar: 'E' },
      { tema: 'Newsletter LinkedIn #1', formato: 'newsletter', pilar: 'A' },
    ],
  },
  {
    fase: 2,
    rector: 'Captación bilateral',
    empresa: [
      { tema: 'Educación servidumbre y agua', formato: 'carrusel', pilar: 'E' },
      { tema: 'Propietarios: qué buscamos', formato: 'carrusel', pilar: 'V' },
      { tema: 'Carrusel errores del vendedor', formato: 'carrusel', pilar: 'V' },
    ],
    personal: [
      { tema: 'Malalcahuello: segunda residencia', formato: 'texto', pilar: 'T' },
      { tema: 'Liquidez en terrenos rurales', formato: 'texto', pilar: 'E' },
      { tema: 'Video vista vs orientación', formato: 'video', pilar: 'T' },
      { tema: 'Opinión mercado UF', formato: 'texto', pilar: 'T' },
    ],
  },
  {
    fase: 2,
    rector: 'Autoridad técnica',
    empresa: [
      { tema: 'Informe mercado comuna', formato: 'carrusel', pilar: 'T' },
      { tema: 'Servicio negociación', formato: 'carrusel', pilar: 'S' },
      { tema: 'CTA mid-quarter', formato: 'carrusel', pilar: 'S' },
    ],
    personal: [
      { tema: 'Artículo: leer un PRC sin ser arquitecto', formato: 'articulo', pilar: 'E' },
      { tema: 'Recorrido Fresia', formato: 'texto', pilar: 'T' },
      { tema: 'Encuesta desarrolladores', formato: 'encuesta', pilar: 'DEV' },
      { tema: 'Caso Puerto Varas', formato: 'texto', pilar: 'S' },
    ],
  },
  {
    fase: 3,
    rector: 'Servicios avanzados',
    empresa: [
      { tema: 'Estudio inversión — servicio', formato: 'carrusel', pilar: 'S' },
      { tema: 'Partner constructora', formato: 'carrusel', pilar: 'P' },
      { tema: 'Carrusel ROI sin prometer', formato: 'carrusel', pilar: 'E' },
    ],
    personal: [
      { tema: 'Desarrollo inmobiliario: cuándo tiene sentido', formato: 'texto', pilar: 'DES' },
      { tema: 'Video due diligence', formato: 'video', pilar: 'E' },
      { tema: 'Texto alianzas comerciales', formato: 'texto', pilar: 'P' },
      { tema: 'Caso inversor Santiago', formato: 'texto', pilar: 'S' },
    ],
  },
  {
    fase: 3,
    rector: 'Leads + partners',
    empresa: [
      { tema: 'Caso calidad de vida', formato: 'carrusel', pilar: 'S' },
      { tema: 'Captación propietario', formato: 'carrusel', pilar: 'V' },
      { tema: 'Web partners estratégicos', formato: 'carrusel', pilar: 'P' },
    ],
    personal: [
      { tema: 'Los Muermos: perfil comprador', formato: 'texto', pilar: 'T' },
      { tema: 'Short-term: operación vs activo', formato: 'texto', pilar: 'ST' },
      { tema: 'Carrusel negociación informada', formato: 'carrusel', pilar: 'E' },
      { tema: 'Newsletter LinkedIn #2', formato: 'newsletter', pilar: 'A' },
    ],
  },
  {
    fase: 3,
    rector: 'Pre-cierre trimestre',
    empresa: [
      { tema: 'Metodología evaluación 12 puntos', formato: 'carrusel', pilar: 'M' },
      { tema: 'Documento descargable', formato: 'documento', pilar: 'E' },
      { tema: 'CTA diagnóstico', formato: 'carrusel', pilar: 'S' },
    ],
    personal: [
      { tema: 'Opinión: ¿burbuja o no en el sur?', formato: 'texto', pilar: 'T' },
      { tema: 'Video comparación 2 terrenos', formato: 'video', pilar: 'T' },
      { tema: 'Confianza intelectual', formato: 'texto', pilar: 'A' },
      { tema: 'FAQ personal', formato: 'texto', pilar: 'A' },
    ],
  },
  {
    fase: 3,
    rector: 'Ecosistema',
    empresa: [
      { tema: 'Alianza #2', formato: 'carrusel', pilar: 'P' },
      { tema: 'Servicio acompañamiento cierre', formato: 'carrusel', pilar: 'S' },
      { tema: 'Caso agregado', formato: 'carrusel', pilar: 'S' },
    ],
    personal: [
      { tema: 'Artículo tiny house contorno rural', formato: 'articulo', pilar: 'TH' },
      { tema: 'Recorrido Ensenada', formato: 'texto', pilar: 'T' },
      { tema: 'Caso reventa', formato: 'texto', pilar: 'S' },
      { tema: 'Encuesta servicios', formato: 'encuesta', pilar: 'S' },
    ],
  },
  {
    fase: 3,
    rector: 'Cierre + momentum',
    empresa: [
      { tema: 'Resultados metodología (agregado)', formato: 'carrusel', pilar: 'A' },
      { tema: 'CTA diagnóstico cierre 90 días', formato: 'carrusel', pilar: 'S' },
      { tema: 'Hiring / colaboradores futuro', formato: 'texto', pilar: 'A' },
    ],
    personal: [
      { tema: 'Retrospectiva 90 días LinkedIn', formato: 'texto', pilar: 'A' },
      { tema: '3 aprendizajes de campo', formato: 'texto', pilar: 'A' },
      { tema: 'Video agradecimiento comunidad', formato: 'video', pilar: 'A' },
      { tema: 'Plan Q4 teaser', formato: 'texto', pilar: 'A' },
    ],
  },
];

/** Horarios fijos LinkedIn */
const SLOTS = [
  { offset: 0, hora: '10:00', canal: 'empresa', idx: 0 },
  { offset: 1, hora: '08:30', canal: 'personal', idx: 0 },
  { offset: 2, hora: '11:00', canal: 'empresa', idx: 1 },
  { offset: 3, hora: '08:30', canal: 'personal', idx: 1 },
  { offset: 4, hora: '08:30', canal: 'personal', idx: 2 },
  { offset: 5, hora: '10:00', canal: 'empresa', idx: 2 },
  { offset: 4, hora: '17:00', canal: 'personal', idx: 3 },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function addDays(dateStr, days) {
  const dt = new Date(`${dateStr}T12:00:00`);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

function toIcsLocal(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
}

function toComparable(dateStr, timeStr) {
  return `${dateStr}T${timeStr}:00`;
}

function isFuture(dateStr, timeStr) {
  return toComparable(dateStr, timeStr) >= cutoff.slice(0, 19);
}

function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function canalLabel(canal) {
  return canal === 'empresa' ? 'Empresa · Land Advisors' : 'Personal · José Katz';
}

function canalEmoji(canal) {
  return canal === 'empresa' ? '🏢' : '👤';
}

function briefForPost(fecha, canal, idx, wi) {
  const map = {
    '2026-06-16': { empresa: { 0: 'rrss/linkedin/posts/LI-2026-06-16-E1.json' } },
    '2026-06-17': { personal: { 0: 'rrss/linkedin/posts/LI-2026-06-17-P1.json' } },
    '2026-06-18': { empresa: { 1: 'rrss/linkedin/posts/LI-2026-06-18-E2.json' } },
    '2026-06-19': { personal: { 1: 'rrss/linkedin/posts/LI-2026-06-19-P2.json' } },
    '2026-06-20': {
      personal: {
        2: 'rrss/linkedin/posts/LI-2026-06-20-P3.json',
        3: 'rrss/linkedin/posts/LI-2026-06-20-P4.json',
      },
    },
    '2026-06-21': { empresa: { 2: 'rrss/linkedin/posts/LI-2026-06-21-E3.json' } },
  };
  return map[fecha]?.[canal]?.[idx] || null;
}

function buildPosts() {
  const posts = [];

  WEEKS.forEach((week, wi) => {
    const weekNum = wi + 1;
    const monday = addDays(START, wi * 7);

    for (const slot of SLOTS) {
      const pool = slot.canal === 'empresa' ? week.empresa : week.personal;
      const item = pool[slot.idx];
      if (!item) continue;

      const fecha = addDays(monday, slot.offset);
      const prefix = slot.canal === 'empresa' ? 'E' : 'P';
      const id = `LI-${fecha}-${prefix}${slot.idx + 1}-W${pad(weekNum)}`;

      posts.push({
        id,
        semana: weekNum,
        fase: week.fase,
        fecha,
        hora: slot.hora,
        canal: slot.canal,
        formato: item.formato,
        pilar: item.pilar,
        tema: item.tema,
        tema_rector: week.rector,
        estado: 'planificado',
        brief: briefForPost(fecha, slot.canal, slot.idx, wi),
        guia:
          wi === 0 && slot.canal === 'personal' && slot.idx === 0
            ? 'rrss/linkedin/guia-publicacion-P1-personal.md'
            : wi === 0
              ? 'rrss/linkedin/guia-semana-01.md'
              : 'rrss/LINKEDIN-estrategia-2026.md',
      });
    }
  });

  return posts.sort((a, b) => toComparable(a.fecha, a.hora).localeCompare(toComparable(b.fecha, b.hora)));
}

function buildCalendarJson(posts) {
  return {
    marca: 'Land Advisors Chile',
    canal: 'linkedin',
    version: '1.0',
    actualizado: new Date().toISOString().slice(0, 19),
    zona_horaria: TZ,
    inicio: START,
    fin: END,
    semanas: 13,
    estrategia: 'rrss/LINKEDIN-estrategia-2026.md',
    rutinas: [
      {
        id: 'LI-RUTINA-DIARIA',
        titulo: 'LinkedIn — 15 min comentarios',
        descripcion: 'Comentar en 3–5 posts de arquitectos, inversionistas o desarrolladores.',
        freq: 'daily',
        hora: '09:00',
        duracion_min: 15,
      },
      {
        id: 'LI-RUTINA-LUN-PLAN',
        titulo: 'LinkedIn — programar semana',
        descripcion: 'Revisar calendario, exportar carruseles, preparar captions.',
        freq: 'weekly',
        weekday: 'MO',
        hora: '09:00',
        duracion_min: 30,
      },
      {
        id: 'LI-RUTINA-VIE-METRICAS',
        titulo: 'LinkedIn — métricas semana',
        descripcion: 'Registrar impresiones, leads y ajustar próxima semana.',
        freq: 'weekly',
        weekday: 'FR',
        hora: '17:30',
        duracion_min: 45,
      },
    ],
    posts,
  };
}

function addMinutes(timeStr, mins) {
  const [hh, mm] = timeStr.split(':').map(Number);
  const total = hh * 60 + mm + mins;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

function buildIcs(calendar) {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const events = [];

  for (const post of calendar.posts) {
    if (!isFuture(post.fecha, post.hora)) continue;

    const end = addMinutes(post.hora, 30);
    const desc = [
      `ID: ${post.id}`,
      `Canal: ${canalLabel(post.canal)}`,
      `Semana: ${post.semana}/13 · Fase ${post.fase}`,
      `Formato: ${post.formato} · Pilar: ${post.pilar}`,
      `Tema: ${post.tema}`,
      '',
      `Estrategia: rrss/LINKEDIN-estrategia-2026.md`,
      post.brief ? `Brief listo: ${post.brief}` : 'Brief: por crear',
    ].join('\\n');

    events.push({
      uid: `${post.id}@landadvisors.cl`,
      start: toIcsLocal(post.fecha, post.hora),
      end: toIcsLocal(post.fecha, end),
      summary: `${canalEmoji(post.canal)} LinkedIn — ${post.tema}`,
      location: canalLabel(post.canal),
      desc: escapeIcs(desc),
      alarms: ['-PT1H', '-PT30M', '-PT10M'],
    });

    const prepDate = addDays(post.fecha, -1);
    const prepTime = '14:00';
    if (isFuture(prepDate, prepTime)) {
      events.push({
        uid: `prep-${post.id}@landadvisors.cl`,
        start: toIcsLocal(prepDate, prepTime),
        end: toIcsLocal(prepDate, '14:30'),
        summary: `📋 Preparar LI — ${post.tema.slice(0, 50)}`,
        location: canalLabel(post.canal),
        desc: escapeIcs(`Publicación: ${post.fecha} ${post.hora} Chile\\n${post.id}\\n${post.tema}`),
        alarms: ['-PT0M'],
      });
    }
  }

  // Rutina diaria (lun–vie)
  const until = END.replace(/-/g, '') + 'T235959Z';
  if (isFuture(START, '09:00')) {
    events.push({
      uid: `LI-RUTINA-DIARIA@landadvisors.cl`,
      start: toIcsLocal(cutoff.slice(0, 10) > START ? cutoff.slice(0, 10) : START, '09:00'),
      end: toIcsLocal(cutoff.slice(0, 10) > START ? cutoff.slice(0, 10) : START, '09:15'),
      summary: '💬 LinkedIn — 15 min comentarios',
      location: 'LinkedIn',
      desc: escapeIcs('Comentar en 3–5 posts relevantes (arquitectos, inversionistas, desarrolladores).'),
      rrule: `FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;UNTIL=${until}`,
      alarms: ['-PT5M'],
    });
  }

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Land Advisors Chile//LinkedIn Calendar//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Land Advisors — LinkedIn 90 días`,
    'X-WR-TIMEZONE:America/Santiago',
    'BEGIN:VTIMEZONE',
    'TZID:America/Santiago',
    'X-LIC-LOCATION:America/Santiago',
    'BEGIN:STANDARD',
    'DTSTART:19700405T000000',
    'TZOFFSETFROM:-0300',
    'TZOFFSETTO:-0400',
    'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SA',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700906T000000',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0300',
    'RRULE:FREQ=YEARLY;BYMONTH=9;BYDAY=1SA',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
  ];

  for (const ev of events) {
    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${ev.uid}`);
    ics.push(`DTSTAMP:${now}`);
    ics.push(`DTSTART;TZID=${TZ}:${ev.start}`);
    ics.push(`DTEND;TZID=${TZ}:${ev.end}`);
    if (ev.rrule) ics.push(`RRULE:${ev.rrule}`);
    ics.push(`SUMMARY:${ev.summary}`);
    ics.push(`DESCRIPTION:${ev.desc}`);
    ics.push(`LOCATION:${escapeIcs(ev.location)}`);
    for (const trigger of ev.alarms || []) {
      ics.push('BEGIN:VALARM');
      ics.push(`TRIGGER:${trigger}`);
      ics.push('ACTION:DISPLAY');
      ics.push(`DESCRIPTION:${ev.summary}`);
      ics.push('END:VALARM');
    }
    ics.push('END:VEVENT');
  }

  ics.push('END:VCALENDAR');
  return ics.join('\r\n') + '\r\n';
}

const posts = buildPosts();
const calendar = buildCalendarJson(posts);

const jsonPath = path.join(linkedinDir, 'calendario-linkedin-90d.json');
const icsPath = path.join(linkedinDir, 'calendario-linkedin-90d.ics');

fs.writeFileSync(jsonPath, JSON.stringify(calendar, null, 2) + '\n', 'utf8');
fs.writeFileSync(icsPath, buildIcs(calendar), 'utf8');

const futurePosts = posts.filter((p) => isFuture(p.fecha, p.hora));
console.log(`JSON: ${jsonPath}`);
console.log(`ICS:  ${icsPath}`);
console.log(`Posts totales: ${posts.length} (${futurePosts.length} futuros desde ${cutoff.slice(0, 10)})`);
console.log(`Empresa: ${posts.filter((p) => p.canal === 'empresa').length} · Personal: ${posts.filter((p) => p.canal === 'personal').length}`);
