# Importar calendario LinkedIn a Google Calendar

Planificación **90 días** · empresa + personal · con recordatorios.

---

## Archivos

| Archivo | Uso |
|---------|-----|
| `calendario-linkedin-90d.ics` | **Importar en Google Calendar / Outlook / Apple** |
| `calendario-linkedin-90d.json` | Fuente editable (regenerar ICS tras cambios) |
| `scripts/generate-linkedin-calendar.mjs` | Generador |

---

## Importar en Google Calendar (5 min)

1. Abre [Google Calendar](https://calendar.google.com)
2. Engranaje ⚙ → **Configuración**
3. Menú izquierdo → **Importar y exportar**
4. **Seleccionar archivo de tu ordenador**
5. Elige:
   ```
   rrss/linkedin/calendario-linkedin-90d.ics
   ```
6. **Calendario de destino:** crea uno nuevo, por ejemplo:
   `Land Advisors — LinkedIn`
7. Clic en **Importar**

Verás eventos con prefijos:
- 🏢 = página **Land Advisors** (empresa)
- 👤 = perfil **José Katz** (personal)
- 📋 = preparar post (día anterior, 14:00)
- 💬 = rutina diaria comentarios (lun–vie 9:00)

---

## Recordatorios incluidos

Cada publicación programada tiene **3 alertas**:
- 1 hora antes
- 30 minutos antes
- 10 minutos antes

Preparación (día anterior): alerta al inicio del bloque 14:00.

---

## Regenerar calendario

Si cambias fechas o temas en el JSON, o quieres excluir eventos pasados:

```powershell
node rrss/linkedin/scripts/generate-linkedin-calendar.mjs --from=2026-06-17
```

Luego **reimporta** el `.ics` (Google Calendar no sincroniza automáticamente).

---

## Horarios fijos (Chile)

| Día | Hora | Canal |
|-----|------|--------|
| Lunes | 10:00 | Empresa |
| Martes | 08:30 | Personal |
| Miércoles | 11:00 | Empresa |
| Jueves | 08:30 | Personal |
| Viernes | 08:30 | Personal |
| Viernes | 17:00 | Personal (4.º post semanal) |
| Sábado | 10:00 | Empresa |

**Rutinas:**
- Lun–vie 09:00 · 15 min comentarios en terceros

---

## Posts con brief listo (Semana 1)

| Fecha | ID | Guía |
|-------|-----|------|
| 16-jun 10:00 | E1 Presentación | Publicado / `guia-semana-01.md` |
| 17-jun 08:30 | P1 Carta fundador | `guia-publicacion-P1-personal.md` |
| 18-jun 11:00 | E2 Metodología | `posts/LI-2026-06-18-E2.json` |
| 19-jun 08:30 | P2 No corredora | `posts/LI-2026-06-19-P2.json` |
| 20-jun 08:30 | P3 3 errores | `posts/LI-2026-06-20-P3.json` |
| 20-jun 17:00 | P4 Video Ensenada | `posts/LI-2026-06-20-P4.json` |
| 21-jun 10:00 | E3 Diagnóstico | `posts/LI-2026-06-21-E3.json` |

Semanas 2–13: temas en `calendario-linkedin-90d.json` (planificados, brief por crear).

---

## Outlook / Apple Calendar

- **Outlook:** Archivo → Abrir y exportar → Importar archivo iCalendar (.ics)
- **Apple Calendar:** Archivo → Importar → seleccionar `.ics`
