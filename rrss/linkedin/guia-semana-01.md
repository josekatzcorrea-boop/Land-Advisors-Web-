# LinkedIn Semana 1 — Guía de publicación

**Campana:** linkedin-arranque-semana-01  
**16–21 junio 2026** · 7 publicaciones  
**Prerequisito:** Perfil optimizado (`perfil-optimizado.md`)

---

## Orden de ejecución

| # | Cuándo | ID | Canal | Acción |
|---|--------|-----|-------|--------|
| 0 | Antes del lun 16 | — | Ambos | Completar checklist perfil |
| 1 | Lun 16 · 10:00 | E1 | Empresa | Publicar carrusel presentación |
| 2 | Mar 17 · 08:30 | P1 | Personal | Publicar texto + foto · fijar comentario |
| 3 | Mié 18 · 11:00 | E2 | Empresa | Publicar carrusel metodología |
| 4 | Jue 19 · 08:30 | P2 | Personal | Publicar carrusel no corredora |
| 5 | Vie 20 · 08:30 | P3 | Personal | Publicar carrusel 3 errores |
| 6 | Vie 20 · 17:00 | P4 | Personal | Subir video nativo Ensenada |
| 7 | Sáb 21 · 10:00 | E3 | Empresa | Publicar carrusel diagnóstico |

---

## Día 0 — Optimizar perfiles (30 min)

1. Abrir `perfil-optimizado.md`
2. Personal: headline → About → Featured (3 links) → banner
3. Empresa: tagline → About → CTA botón → banner → Featured
4. Verificar José Katz como fundador vinculado a página empresa

---

## Publicar carrusel (E1, E2, E3, P2, P3)

1. **Exportar PNG desde HTML** (LinkedIn no acepta HTML):
   ```powershell
   powershell -ExecutionPolicy Bypass -File rrss\scripts\export-carousel.ps1 -PostId LI-2026-06-16-E1 -LinkedIn
   ```
   Salida: `rrss/linkedin/output/LI-2026-06-16-E1/` (6 PNG · 1080×1350)

2. Abrir carpeta `instagram/` dentro del output (nombres listos) o usar `slide-01.png` … `slide-06.png`

3. LinkedIn **página empresa** → Crear publicación → **Añadir imagen** → seleccionar las 6 PNG **en orden**

4. Pegar `caption_linkedin` del JSON correspondiente

5. Publicar → primer comentario = `comentario_fijado` → **fijar comentario**

**Alternativa:** unir PNG en un PDF de 6 páginas y subir como **Documento** (también funciona en LinkedIn).

---

## Publicar texto (P1)

1. LinkedIn personal → Crear publicación
2. Adjuntar foto territorial (sin texto en imagen)
3. Pegar caption de `LI-2026-06-17-P1.json`
4. Fijar comentario con enlace diagnóstico

---

## Publicar video (P4)

1. Grabar o adaptar B-roll Ensenada (guion en JSON)
2. Subtítulos obligatorios
3. Export 1080×1080 o 4:5 · subir nativo (no link YouTube)
4. Caption + comentario fijado

---

## Rutina diaria (15 min)

- Responder todos los comentarios en posts propios
- Comentar 3–5 posts de: arquitectos sur Chile, inversionistas inmobiliarios, desarrolladores turísticos
- Conectar con 5 perfiles/semana (Santiago, UF, real estate)

---

## Cross-promotion Semana 1

| Día | Acción |
|-----|--------|
| Mar 17 | José publica P1 → Land Advisors reacciona (no repost) |
| Mié 18 | Empresa E2 → José comenta con experiencia personal |
| Jue 19 | José P2 → Empresa responde: "Así aplicamos la metodología" + link servicios |
| Sáb 21 | Empresa E3 → José repostea con quote propio |

---

## Métricas a registrar (Sheet)

Fecha · ID · Canal · Impresiones · Reacciones · Comentarios · Clics · Leads · Reunión sí/no

---

## Archivos

| Recurso | Ruta |
|---------|------|
| Perfil | `rrss/linkedin/perfil-optimizado.md` |
| Calendario | `rrss/linkedin/calendario-semana-01.json` |
| Posts | `rrss/linkedin/posts/LI-*.json` |
| Carruseles HTML | `rrss/linkedin/posts/LI-*/index.html` |
| Estrategia 90 días | `rrss/LINKEDIN-estrategia-2026.md` |
