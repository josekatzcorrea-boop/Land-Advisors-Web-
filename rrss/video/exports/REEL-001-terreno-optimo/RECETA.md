# REEL-001 — Registro de producción

**Proyecto:** terreno óptimo · apoyo carrusel `2026-06-24-M1`  
**Estado:** listo publicar · ~42 s  
**Playbook general:** [`../../PLAYBOOK-reel.md`](../../PLAYBOOK-reel.md)

## Export final

| Archivo | Ruta |
|---------|------|
| Video | `REEL-001-final.mp4` |
| Portada | `../../covers/REEL-001-cover.jpg` |
| Brief | `../../briefs/REEL-001-terreno-optimo.json` |
| Guion VO | `../../briefs/REEL-001-vo-script.txt` |

## Valores usados (estándar reutilizable)

- **Audio export:** instrumental Demucs de `Steven Beddall - Only the Brave.mp3` · volumen fijo **0.14** (sin sidechain) — programable en Meta sin editor IG
- **Instrumental:** `Only-the-Brave-instrumental.wav` (voces eliminadas con Demucs)
- **Backup solo VO:** `REEL-001-final-vo-only.mp4`
- **Backup mezcla anterior (karaoke):** `REEL-001-final-v2-karaoke.mp4`
- **Subtítulos:** Montserrat 56px · MarginV 480 · highlights por frase
- **Intro:** 2,5 s · isotipo azul transparente · fondo claro
- **Outro:** 2 s · `brochure/assets/isotipo-3d-blanco-transparente.png`
- **Timeline:** VO termina ~38 s → +2 s dron → +2 s outro

## Highlights subtítulos (orden VTT)

1. Land Advisors  
2. cinco terrenos  
3. miles  
4. óptimo  
5. lago  
6. portales  
7. reunión estratégica  

## Build

```powershell
powershell -ExecutionPolicy Bypass -File rrss\video\scripts\build-reel-001-branded.ps1
```

## Mezcla musical (v5 — Only the Brave)

```powershell
# 1. Instrumental sin voces (Demucs)
python rrss\video\scripts\demucs-instrumental.py `
  "rrss\video\exports\REEL-001-terreno-optimo\Steven Beddall - Only the Brave.mp3" `
  -o "rrss\video\exports\REEL-001-terreno-optimo\Only-the-Brave-instrumental.wav"

# 2. Mezclar sobre export solo-VO (volumen constante, sin ducking)
ffmpeg -y -i REEL-001-final-vo-only.mp4 -i Only-the-Brave-instrumental.wav `
  -filter_complex "[1:a]atrim=0:DUR,asetpts=PTS-STARTPTS,volume=0.14[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.95[aout]" `
  -map 0:v:0 -map "[aout]" -c:v copy -c:a aac -b:a 192k REEL-001-final.mp4
```

## Lecciones aprendidas

- Isotipo outro: usar asset de brochure/carruseles, no filtros CSS ni PNG procesados.
- Duración: calcular con `plan-reel-timeline.py`, no concatenar todos los clips del dron.
- Portada: extraer de `processed/seg-02.mp4`, subir manualmente en IG.
