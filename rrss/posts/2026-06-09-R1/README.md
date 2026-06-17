# Post 2026-06-09-R1 — Relanzamiento oficial

## Archivos

| Archivo | Uso |
|---------|-----|
| `index.html` | Vista previa de las 7 slides en navegador |
| `carousel.css` | Estilos (1080×1350, paleta v2.0) |
| `../2026-06-09-R1.json` | Copy, captions y brief (carpeta `posts/`) |

## Previsualizar

Con el servidor local activo (`landing/serve.ps1`):

```
http://127.0.0.1:8765/rrss/posts/2026-06-09-R1/index.html
```

## Exportar PNG para Instagram / Facebook

```powershell
powershell -ExecutionPolicy Bypass -File rrss\scripts\export-carousel.ps1 -PostId "2026-06-09-R1"
```

Salida: `rrss/output/2026-06-09-R1/slide-01.png` … `slide-07.png` (1080×1350).

## Publicar

1. Subir `slide-01.png` … `slide-07.png` en orden como carrusel.
2. Caption IG: ver `posts/2026-06-09-R1.json` → `caption_ig`.
3. Caption FB: `caption_fb`.
4. Programar: lun 9 jun 2026 · 10:00 · America/Santiago.
