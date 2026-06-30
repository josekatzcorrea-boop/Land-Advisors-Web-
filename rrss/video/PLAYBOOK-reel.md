# Playbook Reel — Land Advisors

Receta estándar validada con **REEL-001** (`terreno óptimo`, jun 2026).  
Usar estos valores en todos los Reels salvo indicación contraria en el brief.

Configuración machine-readable: [`assets/reel-defaults.json`](assets/reel-defaults.json).

---

## Referencia rápida

| Elemento | Valor estándar |
|----------|----------------|
| Formato | 1080×1920 · 9:16 · H.264 + AAC |
| Voz | `es-CL-LorenzoNeural` · rate `+8%` · pitch `+3Hz` |
| Audio en export | **Solo VO** (música se agrega en Instagram) |
| Subtítulos | Montserrat 56px · MarginV 480 · borde `#052C4D` |
| Intro | 2,5 s · isotipo azul sobre fondo claro |
| Outro | 2 s · isotipo blanco sobre `#052C4D` |
| Post-VO | +2 s dron + 2 s outro (= 4 s tras la voz) |
| Build | `scripts/build-reel-001-branded.ps1` (copiar/adaptar por ID) |

---

## Estructura de un proyecto

```
inbox/REEL-XXX-slug/
  drone/4k.mp4          ← material principal (o clips sueltos)
  drone/clips/          ← generados por split-drone-clips.ps1
  audio/                ← vo-es-cl.mp3, .vtt, .ass (generados)
  NOTAS.txt             ← opcional

briefs/
  REEL-XXX-slug.json    ← brief del proyecto
  REEL-XXX-vo-script.txt← guion VO

exports/REEL-XXX-slug/
  REEL-XXX-final.mp4
  processed/            ← segmentos 9:16

covers/REEL-XXX-cover.jpg
```

Plantilla brief: [`briefs/_REEL-TEMPLATE.json`](briefs/_REEL-TEMPLATE.json).

---

## Timeline (cómo se calcula la duración)

```
|-- intro 2,5s --|-- VO + dron --|-- cola 2s --|-- outro 2s --|
                  ↑ VO empieza a 2,65 s (intro + 0,15 s respiro)
                                    ↑ VO termina
                                    └─ +4 s hasta el final del video
```

Fórmula:

```
duracion_total = 2,65 + duracion_vo + 2 + 2
```

Script: `scripts/plan-reel-timeline.py` — elige cuántos clips de dron usar y recorta el último.

---

## Voz en off (edge-tts)

```powershell
python -m edge_tts `
  --voice es-CL-LorenzoNeural `
  --rate=+8% `
  --pitch=+3Hz `
  --text $guion `
  --write-media vo-es-cl.mp3 `
  --write-subtitles vo-es-cl.vtt
```

- **Por qué Lorenzo:** más presencia que Catalina; acento chileno.
- **No incluir música** en el MP4 final — Instagram permite agregar pista propia sin pelear con la VO.

---

## Subtítulos

| Parámetro | Valor |
|-----------|-------|
| Fuente cuerpo | Montserrat Regular |
| Palabra clave | Montserrat SemiBold (1 por frase) |
| Tamaño | 56 px |
| Color | Blanco `#FFFFFF` |
| Borde | Azul institucional `#052C4D` (outline 2,5) |
| Posición | Inferior centrado · **MarginV = 480** |
| Márgenes L/R | 56 px |
| Sync | Offset = 2,65 s (= intro + delay VO) |

Conversión: `python scripts/vtt-to-ass.py vo-es-cl.vtt vo-es-cl.ass 2.65`

**Por reel nuevo:** editar la lista `HIGHLIGHTS` en `vtt-to-ass.py` (o pasarla como argumento en una versión futura) — una palabra/frase clave por línea del VTT, en orden.

Fuentes TTF en `assets/fonts/` (descarga JulietaUla/Montserrat si faltan). Verificar con `scripts/verify-font-lib.py`.

---

## Intro (2,5 s)

- HTML: `assets/branding/intro.html`
- Fondo: gradiente blanco `#FFFFFF → #F4F7F8 → #EEF3F5`
- Isotipo: **`assets/logo-isotipo-3d-transparente.png`** (280 px)
- Texto: *ESTRATEGIA INMOBILIARIA* · Montserrat Light · `#A7ADB3`
- Fade in 0,4 s · fade out 0,5 s

---

## Outro (2 s)

- HTML: `assets/branding/outro.html`
- Fondo sólido: **`#052C4D`**
- Isotipo: **`brochure/assets/isotipo-3d-blanco-transparente.png`** (200 px)
  - **Mismo PNG que carruseles** (`slide--cta-minimal`, posts 2026-06-19, 2026-06-24, etc.)
  - Sin filtros CSS · sin JPEG · sin PNG generados por script
- CTA: *Agenda tu reunión estratégica*
- URL: `landadvisors.cl`
- Descriptor: *ESTRATEGIA INMOBILIARIA*

Regla Cursor permanente: `.cursor/rules/land-advisors-isotipo-transparente.mdc`

---

## Postproducción imagen

1. **Crop** dron horizontal → 9:16 centrado → 1080×1920 @ 30 fps  
2. **Color grade:** `contrast=1.12, saturation=1.42, brightness=0.03` + unsharp suave  
3. **Transiciones xfade** 0,45 s entre intro → clips → outro  
   (`scripts/concat-xfade.py`)  
4. **Quemar subtítulos** con libass (fuentes en `%TEMP%\la-reel-subtitles\`)  
5. **Portada:** frame de `processed/seg-02.mp4` (~mitad del clip), **no** de intro/outro  

---

## Comando build (REEL-001)

```powershell
powershell -ExecutionPolicy Bypass -File rrss\video\scripts\build-reel-001-branded.ps1
```

Para REEL-002+: duplicar el script, cambiar `$Project`, `$OutputFinal`, `$VoScript` y `HIGHLIGHTS` en `vtt-to-ass.py`.

Requisitos: ffmpeg, Python (edge-tts, fonttools), Node + Chrome/Edge, servidor local (`landing/serve.ps1` puerto 8765).

---

## Publicación Instagram

1. Subir `exports/REEL-XXX/REEL-XXX-final.mp4`
2. **Portada manual:** `covers/REEL-XXX-cover.jpg`
3. **Música:** agregar en editor de IG (el video exporta solo VO)
4. Caption y hashtags según brief JSON

---

## Checklist nuevo Reel

- [ ] Crear carpeta `inbox/REEL-XXX/` + material dron
- [ ] Brief JSON desde `_REEL-TEMPLATE.json`
- [ ] Guion VO en `briefs/REEL-XXX-vo-script.txt`
- [ ] Actualizar `HIGHLIGHTS` en `vtt-to-ass.py`
- [ ] Confirmar intro/outro HTML sin cambios (salvo copy CTA)
- [ ] Ejecutar build → revisar outro (isotipo sin caja) y subtítulos (posición + Montserrat)
- [ ] Exportar portada desde frame dron

---

## Proyectos

| ID | Estado | Build | Export |
|----|--------|-------|--------|
| REEL-001 | Listo publicar | `build-reel-001-branded.ps1` | `exports/REEL-001-terreno-optimo/REEL-001-final.mp4` |
