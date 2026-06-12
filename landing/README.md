# Landing Land Advisors Chile

## Versión oficial (activa)

Los archivos en **`landing/`** (raíz de la carpeta: `index.html`, `styles.css`, etc.) son la **versión activa** — la que debes publicar y subir a GitHub.

**Respaldo local (no publicar):** `official/` — snapshot congelado solo para restaurar en tu PC si algo se rompe.

| Carpeta | Descripción |
|---------|-------------|
| `index.html` + CSS/JS en raíz | **Sitio activo** |
| `official/` | **Última versión** (snapshot de referencia) |
| `v1-classic/` | Respaldo histórico — versión clásica pre-v2 |
| `v2-saved/` | Snapshot intermedio con copy experimental (no oficial) |

### Archivos del sitio activo

- `index.html`, `styles.css`
- `landing-ui.js`, `pensamos-video.js`, `territory-carousel.js`
- `chat-widget.js`, `chat-widget.css`

## Servidor local

```powershell
powershell -ExecutionPolicy Bypass -File landing\serve.ps1
```

Abrir: http://127.0.0.1:8765/landing/index.html

## Logo

Descriptor de marca: **ESTRATEGIA INMOBILIARIA**.

Assets en `../assets/`: `logo-horizontal.png` (fondos claros), `logo-horizontal-light.png` (fondos oscuros), `logo-isotipo.png`.

## Personalizar

- Correo y dominio en `index.html` (contacto, mailto del formulario).
- WhatsApp en `chat-widget.js` (`CONFIG.whatsapp.href`).
- Formulario: conectar a tu backend o servicio (Formspree, etc.) en lugar del `mailto` actual.

## Video territorial (sección Cómo pensamos)

Recorrido satelital vía `pensamos-video.js` y `video/tour.json`. Sin video: imagen `como-pensamos.jpg`.

## Optimizar imágenes

```powershell
powershell -ExecutionPolicy Bypass -File landing\optimize-images.ps1
```
