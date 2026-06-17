#!/usr/bin/env node
/**
 * Genera .ics desde calendario JSON para Google Calendar.
 * Uso: node rrss/scripts/generate-calendar-ics.mjs [calendario.json] [salida.ics]
 * Solo incluye eventos futuros respecto a calendario.actualizado o --from=YYYY-MM-DDTHH:mm
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rrssDir = path.join(__dirname, '..');

const calendarPath =
  process.argv[2] || path.join(rrssDir, 'calendario-2026-06.json');
const outPath =
  process.argv[3] ||
  path.join(rrssDir, 'calendario-publicaciones-junio-2026.ics');

const fromArg = process.argv.find((a) => a.startsWith('--from='));
const cal = JSON.parse(fs.readFileSync(calendarPath, 'utf8'));
const tz = cal.zona_horaria || 'America/Santiago';

const cutoff = fromArg
  ? fromArg.replace('--from=', '')
  : cal.actualizado || new Date().toISOString().slice(0, 16);

function pad(n) {
  return String(n).padStart(2, '0');
}

function toIcsLocal(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
}

function toComparable(dateStr, timeStr) {
  return `${dateStr}T${timeStr}:00`;
}

function addDays(dateStr, days) {
  const dt = new Date(`${dateStr}T12:00:00`);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function isFuture(dateStr, timeStr) {
  return toComparable(dateStr, timeStr) > cutoff;
}

const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const events = [];
const posts = (cal.posts || []).filter((p) => p.estado !== 'omitido');

for (const post of posts) {
  const folder = post.content_ref || post.id;
  const exportDir = post.export_output || `rrss/output/${folder}/instagram/`;

  if (isFuture(post.fecha, post.hora)) {
    const desc = [
      `Post: ${post.id}`,
      `Pilar: ${post.pilar}`,
      `Tema: ${post.tema}`,
      `Formato: ${post.formato}`,
      `Hora Chile: ${post.hora}`,
      '',
      `Piezas: ${exportDir}`,
      'Guía: rrss/guia-publicacion-manual.md',
    ].join('\\n');

    const [hh, mm] = post.hora.split(':').map(Number);
    const endH = mm + 30 >= 60 ? hh + 1 : hh;
    const endM = (mm + 30) % 60;

    events.push({
      uid: `${post.id}@landadvisors.cl`,
      start: toIcsLocal(post.fecha, post.hora),
      end: toIcsLocal(post.fecha, `${pad(endH)}:${pad(endM)}`),
      summary: `📱 Publicar IG+FB — ${post.tema}`,
      desc,
      alarms: ['-PT30M', '-PT10M'],
    });
  }

  const prepDate = addDays(post.fecha, -1);
  const prepTime = '14:00';
  if (isFuture(prepDate, prepTime)) {
    events.push({
      uid: `prep-${post.id}@landadvisors.cl`,
      start: toIcsLocal(prepDate, prepTime),
      end: toIcsLocal(prepDate, '14:30'),
      summary: `📋 Preparar post — ${post.tema}`,
      desc: escapeIcs(
        `Revisar piezas y captions. Publicación: ${post.fecha} ${post.hora} Chile.\\n${post.id}`
      ),
      alarms: ['-PT0M'],
    });
  }
}

let ics = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Land Advisors Chile//RRSS Calendar//ES',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  `X-WR-CALNAME:Land Advisors RRSS (desde ${cutoff.slice(0, 10)})`,
  'BEGIN:VTIMEZONE',
  'TZID:America/Santiago',
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
  ics.push(`DTSTART;TZID=${tz}:${ev.start}`);
  ics.push(`DTEND;TZID=${tz}:${ev.end}`);
  ics.push(`SUMMARY:${escapeIcs(ev.summary)}`);
  ics.push(`DESCRIPTION:${ev.desc}`);
  ics.push('LOCATION:Instagram + Facebook @landadvisorschile');
  for (const trigger of ev.alarms) {
    ics.push('BEGIN:VALARM');
    ics.push(`TRIGGER:${trigger}`);
    ics.push('ACTION:DISPLAY');
    ics.push(`DESCRIPTION:${escapeIcs(ev.summary)}`);
    ics.push('END:VALARM');
  }
  ics.push('END:VEVENT');
}

ics.push('END:VCALENDAR');

fs.writeFileSync(outPath, ics.join('\r\n') + '\r\n', 'utf8');
console.log(`ICS generado: ${outPath}`);
console.log(`Corte temporal: ${cutoff}`);
console.log(`Eventos futuros: ${events.length} (${posts.length} posts en calendario)`);
