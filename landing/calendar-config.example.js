/**
 * Calendario de reuniones — copiar a calendar-config.js
 *
 * Opción A — Google Calendar (gratis, recomendado si ya usas Google):
 * 1. calendar.google.com → Crear → Cita programada
 * 2. Duración 30 min, disponibilidad según tu agenda
 * 3. Copia el enlace público de reserva a url abajo
 *
 * Opción B — Calendly (calendly.com):
 * 1. Evento "Reunión estratégica — Land Advisors" (30 min)
 * 2. Copia el enlace (ej. https://calendly.com/tu-usuario/reunion-estrategica)
 *
 * Puedes usar distintos enlaces por servicio en events (opcional).
 */
window.LA_CALENDAR = {
  enabled: false,
  url: "",
  label: "Elegir horario para reunión",
  events: {
    diagnostico: "",
    busqueda: "",
    estudio: "",
    estructuracion: "",
    otro: "",
  },
};
