# Land Advisors — Video / Reels



Carpeta de trabajo para Reels, videos de feed e historias.



## Documentación principal



| Archivo | Para qué |

|---------|----------|

| **[PLAYBOOK-reel.md](PLAYBOOK-reel.md)** | Receta completa: voz, subtítulos, intro/outro, timeline, logos |
| **[PLAN-REELS-2026-07-08.pdf](export/PLAN-REELS-2026-07-08.pdf)** | **Plan 8 Reels jul–ago 2026** — guiones, grabación, orden de sesiones |
| **[calendario-reels-2026-07-08.json](calendario-reels-2026-07-08.json)** | Calendario Reels alineado IG (4/mes) |

| **[assets/reel-defaults.json](assets/reel-defaults.json)** | Mismos valores en JSON (reutilizable en scripts) |

| **[briefs/_REEL-TEMPLATE.json](briefs/_REEL-TEMPLATE.json)** | Plantilla brief para REEL-002+ |

| `.cursor/rules/land-advisors-isotipo-transparente.mdc` | Regla isotipo/logo transparente |



**Referencia validada:** REEL-001 → `exports/REEL-001-terreno-optimo/RECETA.md`



## Estructura



```

rrss/video/

  PLAYBOOK-reel.md      ← empezar aquí para un Reel nuevo

  briefs/               ← brief JSON + guion VO por proyecto

  inbox/                ← material crudo

  exports/              ← videos finales

  covers/               ← portadas 1080×1920

  scripts/              ← pipeline ffmpeg / edge-tts

  assets/

    reel-defaults.json  ← estándar voz, subs, branding

    branding/           ← intro.html, outro.html

    fonts/              ← Montserrat para subtítulos

```



## Estándar REEL (resumen)



| | |

|---|---|

| Formato | 1080×1920 · H.264 · AAC |

| Voz | `es-CL-LorenzoNeural` · +8% · +3Hz · **solo VO** (música en IG) |

| Subtítulos | Montserrat 56px · MarginV 480 · palabra clave SemiBold |

| Intro | 2,5 s · isotipo azul · fondo claro |

| Outro | 2 s · isotipo blanco brochure · `#052C4D` |

| Duración | VO + 4 s (2 cola dron + 2 outro) |



## Cómo cargar material



1. Carpeta en `inbox/REEL-XXX-slug/`

2. Sube a **drone/** (largo o clips), **broll/**, **talking/**, **audio/**

3. Dron largo → `split-drone-clips.ps1` genera `drone/clips/`



## Build



```powershell

powershell -ExecutionPolicy Bypass -File rrss\video\scripts\build-reel-001-branded.ps1

```



Requisitos: ffmpeg, Python (edge-tts, fonttools), Node + Chrome/Edge.



## Proyectos



| ID | Estado | Export |

|----|--------|--------|

| REEL-001 | Listo publicar · **24-jun 18:00** | `exports/REEL-001-terreno-optimo/REEL-001-final.mp4` |



## Branding



Ver `rrss/branding-book.md` · isotipo claro: `assets/logo-isotipo-3d-transparente.png` · isotipo oscuro: `brochure/assets/isotipo-3d-blanco-transparente.png`


