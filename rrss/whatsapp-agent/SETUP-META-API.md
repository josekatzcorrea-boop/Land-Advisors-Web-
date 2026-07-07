# WhatsApp Cloud API — Configuración paso a paso

Agente de calificación para campaña **Búsqueda personalizada 30%** (+56974533265).

---

## Requisitos previos

- Cuenta [Meta Business](https://business.facebook.com) con negocio **Land Advisors Chile**
- Acceso admin al número **+56 9 7453 3265** (o número nuevo para migrar a Cloud API)
- Servidor HTTPS público (Railway, Render o Cloudflare Workers — ver §6)

---

## Activación selectiva (solo web y publicidad)

El agente **ignora en silencio** a quien escribe directo al número: **sin respuesta automática, sin envío por API, sin costo** de conversación generado por el bot.

Solo se activa si detecta origen de campaña:

| Origen | Cómo lo detecta el servidor |
|--------|----------------------------|
| **Landing campaña** | Mensaje incluye `[Ref: LA-BUSQ30]` o texto de la oferta |
| **Meta Ads (Click to WhatsApp)** | Objeto `referral` en webhook (`ctwa_clid` o `source_type: ad`) |
| **Google Ads** | Link `wa.me` con texto prellenado + `(Ref: google / paid / ...)` |

**Contacto directo** (amigos, clientes antiguos, «Hola» espontáneo): el webhook recibe el mensaje, **no envía nada** y José lo atiende en su teléfono como siempre.

### Costo WhatsApp API

Meta cobra cuando **tú envías** mensajes por la API. Recibir webhooks es gratis. Al ignorar contactos directos, el agente **no genera cargo** por esas conversaciones.

### Mismo número personal y empresa — usar Coexistencia (obligatorio)

Tu caso: +56974533265 es personal **y** Land Advisors. **No migres** el número a Cloud API puro sin coexistencia.

1. En Meta → WhatsApp → registrar el número con modo **Coexistencia** (WhatsApp Business app + API)
2. Contactos directos → llegan a tu app WhatsApp Business en el celular, respondes tú, el agente no interviene
3. Leads de web/ads → el agente responde por API solo en esas conversaciones

Sin coexistencia, los mensajes pueden dejar de llegar a tu app móvil y quedar solo en la bandeja de Meta Business Suite.

### URL WhatsApp para Google Ads

Usar como destino final (codificar en el anuncio):

```
https://wa.me/56974533265?text=Hola%2C%20vi%20la%20oferta%20de%20B%C3%BAsqueda%20personalizada%20(30%25%20dto.%2C%20v%C3%A1lida%20hasta%2030%20de%20septiembre).%20Me%20interesa%20saber%20si%20aplica%20para%20mi%20caso.%0A%0A%5BRef%3A%20LA-BUSQ30%5D%0A%0A(Ref%3A%20google%20%2F%20paid%20%2F%20busqueda-30-sep2026)
```

### Meta Ads — Click to WhatsApp

1. Objetivo **Ventas** o **Interacción** → destino **WhatsApp**
2. Número: +56974533265
3. Meta envía `referral` en el primer mensaje → el agente se activa aunque el usuario borre el texto
4. No hace falta plantilla para la primera respuesta (ventana 24 h)

### Coexistencia con WhatsApp Business (obligatorio en tu caso)

Mismo teléfono personal y empresa:

1. Activar **Coexistencia** al conectar el número a Cloud API
2. Contactos directos → app en el celular, sin bot, sin costo API
3. Leads campaña → agente automatiza solo esas conversaciones

Si migras 100% a Cloud API sin coexistencia, los mensajes personales no llegarán a tu WhatsApp del bolsillo.

---

## 1. Crear / usar app en Meta Developers

1. Ir a [developers.facebook.com](https://developers.facebook.com) → **Mis apps**
2. Usar la misma app de RRSS de Land Advisors **o** crear app tipo **Negocio**
3. Agregar producto **WhatsApp** → **Configuración de la API**

Anotar:

| Variable | Dónde encontrarla |
|----------|-------------------|
| `META_APP_ID` | Configuración de la app → Básica |
| `META_APP_SECRET` | Configuración de la app → Básica (mostrar) |
| `META_WA_PHONE_NUMBER_ID` | WhatsApp → API Setup → *Phone number ID* |
| `META_WA_BUSINESS_ACCOUNT_ID` | WhatsApp → API Setup → *WhatsApp Business Account ID* |

---

## 2. Token de acceso permanente

El token temporal de la consola expira en 24 h. Para producción:

1. **Business Settings** → **Usuarios** → **Usuarios del sistema** → Agregar
2. Rol: **Admin** del negocio Land Advisors
3. **Asignar activos** → Apps → tu app → control total
4. **Generar token** con permisos:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Copiar token → `META_WA_ACCESS_TOKEN` en `.env`

> Guardar el token solo en el servidor. Nunca en el repo ni en el front.

---

## 3. Conectar el número +56974533265

### Si el número ya está en WhatsApp Business (app móvil)

Debes **migrar** a Cloud API (el número deja de funcionar en la app móvil):

1. WhatsApp → **Números de teléfono** → **Agregar número**
2. Seguir verificación por SMS/voz
3. O usar **Coexistencia** (si Meta lo ofrece en tu región) para mantener app + API

### Si es número nuevo

1. Registrar en API Setup con verificación SMS
2. Completar **Display name**: `Land Advisors Chile`
3. Esperar aprobación del nombre (puede tardar 1–3 días)

---

## 4. Configurar variables locales

```bash
cd rrss/whatsapp-agent
cp .env.example .env
```

Completar `.env`:

```env
META_GRAPH_VERSION=v22.0
META_WA_ACCESS_TOKEN=EAAxxxx...
META_WA_PHONE_NUMBER_ID=123456789012345
META_WA_VERIFY_TOKEN=land-advisors-webhook-2026
LA_NOTIFY_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbw47Uo77XsNA35HNjlbCA41jpdzAFqO2Mu0PdQ6pbGfpM-da44rW0m1sIUwU7IoTqrc/exec
PORT=8787
```

`META_WA_VERIFY_TOKEN` puede ser cualquier string secreto que tú elijas (debe coincidir con Meta).

Verificar conexión:

```bash
npm run verify
```

Debe mostrar `OK` en las tres variables obligatorias y el número conectado.

---

## 5. Probar en local (ngrok)

Meta exige HTTPS en el webhook. Para desarrollo:

```bash
# Terminal 1
npm start

# Terminal 2 (ngrok)
ngrok http 8787
```

Copiar URL pública, ej. `https://abc123.ngrok-free.app`

---

## 6. Desplegar en producción

### Opción A — Railway (recomendada)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Root directory: `rrss/whatsapp-agent`
3. Variables de entorno: las mismas del `.env`
4. Railway asigna URL HTTPS, ej. `https://land-advisors-wa.up.railway.app`
5. Webhook URL final: `https://land-advisors-wa.up.railway.app/webhook`

### Opción B — Render

1. New **Web Service** → repo → root `rrss/whatsapp-agent`
2. Build: `npm install` · Start: `npm start`
3. Health check path: `/health`
4. Añadir env vars del `.env`

### Opción C — VPS propio

```bash
npm start
# detrás de nginx/caddy con TLS y proxy a :8787
```

---

## 7. Suscribir webhook en Meta

1. Meta Developers → tu app → **WhatsApp** → **Configuración**
2. Sección **Webhook** → **Editar**
3. **URL de devolución de llamada**: `https://TU-DOMINIO/webhook`
4. **Token de verificación**: el mismo que `META_WA_VERIFY_TOKEN`
5. Clic **Verificar y guardar** (Meta hace GET a tu servidor)
6. Suscribir campo **`messages`**

Si la verificación falla: servidor arriba (`/health`), token idéntico en Meta y `.env`, URL con `/webhook` al final.

### Suscribir app al WABA (obligatorio)

Tras configurar el webhook, ejecuta en local:

```bash
npm run fix-webhook
```

Si la app **W API** no aparece suscrita al WABA, Meta no enviará mensajes entrantes al webhook.

---

## 8. Probar el flujo completo

Desde otro teléfono, escribir al **+56 9 7453 3265**:

```
Hola, vi la oferta de Búsqueda personalizada (30% dto., válida hasta 30 de septiembre). Me interesa saber si aplica para mi caso.
```

Deberías recibir:

1. Saludo + pregunta objetivo
2. Presupuesto → zona → plazo → ubicación
3. Resumen oferta 3,5 UF + link calendario
4. Notificación WhatsApp a José (vía CallMeBot proxy)

Casos de prueba:

| Respuesta en zona | Resultado esperado |
|-------------------|-------------------|
| Puerto Varas + plazo 3–6 meses | Oferta + calendario |
| Solo explorando | Nurture + calendario diagnóstico |
| Otra zona del sur | Mensaje not_fit |
| «hablar con josé» | Escalación humana + notificación |

---

## 9. Ventana de mensajería (24 h)

WhatsApp Cloud API solo permite **mensajes libres** dentro de las 24 h desde el último mensaje del usuario.

- El agente responde en esa ventana → OK
- Para mensajes proactivos fuera de 24 h necesitas **plantillas** aprobadas en Meta

Para esta campaña (respuesta a clic desde ads/landing) no necesitas plantillas iniciales.

---

## 10. App Review (cuando pases de modo desarrollo)

En modo desarrollo solo responde a números **añadidos como testers** en la app.

Para producción pública:

1. Completar **Business Verification** en Business Manager
2. App Review → permiso `whatsapp_business_messaging`
3. Grabar video corto del flujo (usuario escribe → bot responde → calendario)

---

## 11. Monitoreo

| Endpoint | Uso |
|----------|-----|
| `GET /health` | Ping uptime (Railway/Render) |
| Logs del servidor | Errores API Meta |
| WhatsApp Manager | Métricas de entrega |

---

## Archivos del agente

| Archivo | Rol |
|---------|-----|
| `server.mjs` | Webhook HTTP |
| `lib/flow-engine.mjs` | Estados y calificación |
| `flow.json` | Reglas y quick replies |
| `messages.json` | Textos |
| `lib/wa-send.mjs` | Envío Graph API |
| `lib/notify-jose.mjs` | Alerta a José (CallMeBot) |

---

## Limitaciones actuales (MVP)

- Sesiones en `sessions.json` (disco local). En Render free se pierden al redeploy.
- Solo mensajes **texto** (no audio/imagen por ahora).
- Sin IA generativa — flujo determinístico según `flow.json`.

## Scripts de operación

```bash
npm run verify        # token + número OK
npm run fix-webhook   # suscribe app W API al WABA
npm run test-webhook  # simula mensaje entrante
```

Deploy producción: ver **`DEPLOY-RENDER.md`** y `render.yaml` en la raíz del repo.

---

## Soporte

Calendario reunión: https://calendar.app.google/NnBG8xc4b2HbByu67  
Landing campaña: https://www.landadvisors.cl/campanas/busqueda-personalizada-30/
