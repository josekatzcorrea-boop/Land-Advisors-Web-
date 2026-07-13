# Meta — Serie “Sueño del sur” (antesala publicidad)

5 carruseles listos para programar en Meta (IG / FB / Ads).
Formato: **1080×1350** · 5 slides · slide 1 = solo foto + título + isotipo.

## Publicaciones

| ID | Tema | Carpeta PNG |
|----|------|-------------|
| 2026-07-16-MS1 | Tu casa en la pradera | `rrss/output/2026-07-16-MS1/instagram/` |
| 2026-07-17-MS2 | Un refugio entre árboles | `rrss/output/2026-07-17-MS2/instagram/` |
| 2026-07-18-MS3 | Así se siente el sur | `rrss/output/2026-07-18-MS3/instagram/` |
| 2026-07-19-MS4 | Tu terreno. Tu ritmo. | `rrss/output/2026-07-19-MS4/instagram/` |
| 2026-07-20-MS5 | Despertar con el lago cerca | `rrss/output/2026-07-20-MS5/instagram/` |

## Cómo publicar / pautar

1. Sube los PNG en orden (`-01` … `-05`).
2. Copia `caption_ig` / `caption_fb` / `meta_primary_text` desde el JSON de cada post.
3. CTA: reunión estratégica → landadvisors.cl (UTM ya en cada JSON).
4. Tono: sueño primero, criterio después — **no** sermón.

## Exportar de nuevo

```powershell
cd rrss/scripts
.\export-carousel.ps1 -PostId 2026-07-16-MS1 -SlideCount 5 -IgPrefix land-advisors-casa-pradera
```

Copys completos: cada `rrss/posts/2026-07-*-MS*.json`.
