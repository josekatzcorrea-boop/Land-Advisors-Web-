# Integración Instagram / Facebook — Land Advisors

Base técnica para publicar de forma autónoma (después de aprobación WhatsApp) usando **Meta Graph API**.

## Qué necesitas antes de empezar

1. **Cuenta Instagram Business o Creator** de Land Advisors.
2. **Página de Facebook** vinculada a esa cuenta (Meta Business Suite → Configuración → Cuentas vinculadas).
3. **App en Meta for Developers** con producto *Instagram Graph API*.
4. **Permisos** en el token de la página:
   - `instagram_business_basic`
   - `instagram_business_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`

Sin esto, la API no permite publicar.

> **Nota:** Meta renombró permisos en 2025. Los antiguos `instagram_basic` / `instagram_content_publish` ya no aplican para apps nuevas.

---

## Meta for Developers — paso a paso completo

Ya tienes Meta Business Suite. Esta guía cubre solo la parte de **developers.facebook.com**.

### Fase 0 — Validar en Business Suite (5 min)

Antes de entrar a Developers, confirma esto en [business.facebook.com](https://business.facebook.com/):

1. **Configuración del negocio** → **Cuentas** → **Páginas de Facebook**  
   → Debe existir la página oficial de Land Advisors.

2. **Cuentas** → **Cuentas de Instagram**  
   → La cuenta de Land Advisors debe aparecer **conectada** a esa página.

3. Tu usuario de Facebook debe ser **Administrador** de la página y del portfolio de negocio.

Si Instagram no está vinculado: en Business Suite → **Configuración** → **Cuentas vinculadas** → conectar Instagram a la página.

---

### Fase 1 — Cuenta de desarrollador (si no la tienes)

1. Ve a [developers.facebook.com](https://developers.facebook.com/).
2. Inicia sesión con tu Facebook personal (el que administra Land Advisors).
3. Si es tu primera vez, acepta los términos de desarrollador.

---

### Fase 2 — Crear la app

1. En el dashboard, clic en **Crear app** (arriba a la derecha).
2. **Conectar un negocio** → selecciona el portfolio de Land Advisors (o “Conectar más tarde”; puedes hacerlo después en *Configuración de la app → Básica*).
3. **Caso de uso** → elige **Otro** → **Siguiente**.
4. **Tipo de app** → **Negocios (Business)** → **Siguiente**.
5. **Detalles:**
   - Nombre sugerido: `Land Advisors RRSS`
   - Email de contacto: tu correo
6. **Crear app**.

Quedas en el panel de la app nueva.

---

### Fase 3 — Elegir el setup correcto de Instagram

Land Advisors usa Instagram **Profesional vinculado a Página de Facebook**. Por eso necesitas el setup con **Facebook Login**, no el de “Instagram Login”.

1. En el panel de la app, busca el producto **Instagram**.
2. Clic en **Configurar (Set up)**.
3. Meta agrega por defecto “API setup with Instagram login” — **no uses ese** para tu caso.
4. En la documentación lateral o en *Instagram → API setup with Facebook login*, sigue ese camino.
5. Agrega también el producto **Facebook Login for Business**:
   - Panel → **Agregar productos** → **Facebook Login for Business** → **Configurar**.

**Webhooks:** puedes omitirlos por ahora (los necesitaremos para WhatsApp en fase 2).

---

### Fase 4 — Roles y modo de la app

1. Menú izquierdo → **Roles de la app** → **Roles**.
2. Confirma que tu usuario aparece como **Administrador** o **Desarrollador**.
3. La app arranca en modo **Desarrollo (Development)**. Eso está bien para las primeras pruebas con tu propia cuenta.

En modo Desarrollo, **solo** usuarios con rol en la app pueden autorizarla. Como publicarás en la cuenta de Land Advisors que tú administras, puedes probar sin App Review.

---

### Fase 5 — Copiar App ID y App Secret

1. Menú → **Configuración de la app** → **Básica**.
2. Copia:
   - **Identificador de la app** → `META_APP_ID`
   - **Clave secreta de la app** → clic en **Mostrar** → `META_APP_SECRET`
3. En la misma pantalla, vincula el **Portfolio comercial** de Land Advisors si aún no lo hiciste (requisito para publicar la app más adelante).

Guarda estos valores en `.env` (nunca en el repositorio).

---

### Fase 6 — Obtener token con Graph API Explorer (pruebas)

Esta es la forma más rápida de validar la conexión.

1. Abre [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. **Aplicación de Meta** → selecciona `Land Advisors RRSS`.
3. **Usuario o página** → deja “Usuario” por ahora.
4. Clic en **Generar token de acceso**.
5. Marca estos permisos:
   - `instagram_business_basic`
   - `instagram_business_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
6. Autoriza con el Facebook que administra la página de Land Advisors.

#### 6a. Obtener token de la página

En el Explorer, con el token de usuario activo:

```
GET /me/accounts?fields=id,name,access_token,instagram_business_account
```

En la respuesta JSON, localiza la página de Land Advisors y copia:

| Campo | Variable `.env` |
|-------|-----------------|
| `id` | `META_PAGE_ID` |
| `access_token` | `META_PAGE_ACCESS_TOKEN` |
| `instagram_business_account.id` | `META_IG_USER_ID` |

Si `instagram_business_account` viene vacío, Instagram no está bien vinculado a esa página → vuelve a Fase 0.

#### 6b. Verificar la cuenta Instagram

Cambia el token del Explorer al **token de la página** (dropdown “Usuario o página”).

```
GET /{META_IG_USER_ID}?fields=id,username,name,followers_count,media_count
```

Deberías ver el `@usuario` de Land Advisors.

#### 6c. Probar publicación (opcional, desde Explorer)

Con token de **página**:

```
POST /{META_IG_USER_ID}/media
  image_url = https://URL-PUBLICA-DE-UNA-IMAGEN.jpg
  caption = Prueba Land Advisors API
```

Copia el `id` del contenedor y luego:

```
GET /{container-id}?fields=status_code
```

Espera `FINISHED`, luego:

```
POST /{META_IG_USER_ID}/media_publish
  creation_id = {container-id}
```

---

### Fase 7 — Token de larga duración (para el agente autónomo)

El token del Explorer dura ~1 hora. Para automatizar necesitas uno más estable.

**Opción A — Token de página (recomendado):**

Los tokens de página obtenidos desde un token de usuario de larga duración **no expiran** mientras no cambies la contraseña ni revoques permisos.

1. Intercambia el token corto por uno de usuario de 60 días:

```
GET /oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={META_APP_ID}
  &client_secret={META_APP_SECRET}
  &fb_exchange_token={TOKEN_CORTO_DEL_EXPLORER}
```

2. Con ese token de usuario de 60 días, repite `GET /me/accounts` y guarda el `access_token` de la página en `META_PAGE_ACCESS_TOKEN`.

**Opción B — System User (producción seria):**

En Business Suite → **Usuarios del sistema** → crear usuario del sistema con acceso a la página e Instagram → generar token permanente. Más estable para un agente 24/7; lo configuramos cuando pases a producción.

---

### Fase 8 — Conectar con este proyecto

```powershell
cd "C:\Users\josek\Desktop\Land Advisors IA\Contexto\rrss\integration"
copy .env.example .env
# Pegar META_APP_ID, META_APP_SECRET, META_PAGE_ACCESS_TOKEN, META_IG_USER_ID, META_PAGE_ID
node scripts/verify-connection.mjs
```

---

### Fase 9 — App Review (solo cuando vayas a producción 24/7)

Para que la app publique **sin depender** de que un desarrollador esté logueado, Meta exige **App Review**.

1. Menú → **Revisión de la app** → **Solicitudes**.
2. Solicita:
   - `instagram_business_basic`
   - `instagram_business_content_publish`
3. Para cada permiso, sube un **video** mostrando:
   - Cómo el agente genera un post para Land Advisors
   - Cómo tú lo apruebas (WhatsApp)
   - Cómo se publica en Instagram
4. Descripción de uso: *“Herramienta interna de Land Advisors para programar contenido educativo sobre inversión territorial en Instagram, con aprobación humana previa.”*

Meta suele tardar **2–4 semanas**. Mientras tanto, en modo Desarrollo + tu cuenta admin puedes probar todo el flujo.

---

## Resumen visual del flujo

```
Meta Business Suite          Meta for Developers              Este proyecto
(IG ↔ Página FB)      →      App Business + Instagram  →     .env + verify-connection
                             Graph API Explorer               publish-instagram.mjs
                             Token de página
                                      ↓
                             App Review (producción)
```

### 4. Configurar este proyecto

```powershell
cd "C:\Users\josek\Desktop\Land Advisors IA\Contexto\rrss\integration"
copy .env.example .env
# Edita .env con tus valores
```

Variables:

| Variable | Descripción |
|----------|-------------|
| `META_APP_ID` | ID de la app Meta |
| `META_APP_SECRET` | Secreto de la app |
| `META_PAGE_ACCESS_TOKEN` | Token de la **página** (no el de usuario personal) |
| `META_IG_USER_ID` | ID numérico de la cuenta Instagram Business |
| `META_PAGE_ID` | ID de la página Facebook (opcional, para validación) |

### 5. Verificar conexión

```powershell
node scripts/verify-connection.mjs
```

Si todo está bien, verás el `@usuario`, seguidores y las páginas conectadas.

## Publicar un post de prueba

Las imágenes deben estar en **URLs públicas HTTPS** (Meta las descarga desde internet).

```powershell
node scripts/publish-instagram.mjs `
  --caption "Prueba de conexión Land Advisors" `
  --image "https://tu-dominio.com/imagen.jpg"
```

O con el formato alineado al calendario:

```powershell
node scripts/publish-instagram.mjs --payload examples/post-payload.example.json
```

## Cómo encaja con el flujo autónomo

```
Calendario (calendario-2026-06.json)
        ↓
Agente genera brief + piezas visuales
        ↓
Aprobación WhatsApp (Aprobar / Regenerar / Omitir)
        ↓
Post aprobado → payload JSON + URLs de imágenes
        ↓
publish-instagram.mjs (ahora) → scheduler + cola (fase siguiente)
        ↓
Instagram (+ Facebook con el mismo módulo, fase siguiente)
```

Esta carpeta cubre la capa **Meta API**. Lo que viene después:

- Generación automática de slides (agente + branding book).
- Cola programada por `fecha` + `hora` en `America/Santiago`.
- Webhook WhatsApp para aprobación.
- Publicación en Facebook reutilizando el mismo token de página.

## Límites y reglas Meta

- Máximo **25 publicaciones por día** por cuenta Instagram (límite API).
- Carruseles: hasta **10 imágenes**.
- Las URLs deben responder `200` y ser JPG/PNG.
- Reels y Stories requieren endpoints distintos (fase 2 del plan).

## Solución de problemas

| Error | Causa habitual |
|-------|----------------|
| `(#10) Application does not have permission` | Faltan permisos en la app o el token |
| `Instagram account is not a Business account` | La cuenta es personal; convertir a Business/Creator |
| `Media ID is not available` | Imagen aún procesándose; el script ya espera, pero la URL puede ser inválida |
| `Only photo or video can be accepted` | URL no accesible públicamente o formato no soportado |

## Archivos

| Archivo | Rol |
|---------|-----|
| `lib/meta-client.mjs` | Cliente Graph API (contenedores + publicación) |
| `lib/config.mjs` | Carga de credenciales |
| `scripts/verify-connection.mjs` | Diagnóstico de conexión |
| `scripts/publish-instagram.mjs` | Publicación manual / prueba |
| `examples/post-payload.example.json` | Formato de payload para el agente |
