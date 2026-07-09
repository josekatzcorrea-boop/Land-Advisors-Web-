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

## SEO y plataforma territorial

- Estrategia autoridad: `seo/estrategia-autoridad-2026.md`
- Estrategia plataforma 2036: `estrategia-plataforma-2036.md`
- Índice ILA v0: `seo/ila-index.json` → `/indice-territorial/`
- Regenerar páginas SEO: `node landing/scripts/build-seo.mjs`

## Servidor local

**Importante:** el servidor debe estar corriendo y usar la URL con `/landing/`.

```powershell
powershell -ExecutionPolicy Bypass -File landing\restart-serve.ps1
```

O manualmente (deja la terminal abierta):

```powershell
powershell -ExecutionPolicy Bypass -File landing\serve.ps1
```

URLs de prueba:

- Home: http://127.0.0.1:8765/landing/index.html
- Índice ILA: http://127.0.0.1:8765/landing/indice-territorial/
- Inteligencia: http://127.0.0.1:8765/landing/inteligencia-territorial/

Si ves `ERR_CONNECTION_REFUSED`, el servidor no está activo. Si ves `404` en rutas con `/` al final, reinicia con `restart-serve.ps1` (versión actualizada de `serve.ps1`).

## Logo

Descriptor de marca: **ESTRATEGIA INMOBILIARIA**.

Assets en `../assets/`: `logo-horizontal.png` (fondos claros), `logo-horizontal-light.png` (fondos oscuros), `logo-isotipo.png`.

## Personalizar

- Correo y dominio en `index.html` (contacto, mailto del formulario).
- WhatsApp en `chat-widget.js` (`CONFIG.whatsapp.href`).
- Formulario WhatsApp: copiar `whatsapp-config.example.js` → `whatsapp-config.js`, desplegar `scripts/whatsapp-proxy.gs` en Google Apps Script y pegar la URL en `webhookUrl` (ver instrucciones en el example).
- Calendario post-formulario: copiar `calendar-config.example.js` → `calendar-config.js`, pegar URL de Google Calendar (Cita programada) o Calendly, y poner `enabled: true`.
- Formulario: conectar a tu backend o servicio (Formspree, etc.) en lugar del `mailto` actual.

## Video territorial (sección Cómo pensamos)

Recorrido satelital vía `pensamos-video.js` y `video/tour.json`. Sin video: imagen `como-pensamos.jpg`.

## Optimizar imágenes

```powershell
powershell -ExecutionPolicy Bypass -File landing\optimize-images.ps1
```
