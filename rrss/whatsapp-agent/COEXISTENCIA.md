# Coexistencia +56974533265 — por qué falló Meta y qué hacer

## Por qué nada funcionó hasta ahora

| Lo que probaste | Por qué falla |
|-----------------|---------------|
| "Agregar número" + SMS | Error **#2655122** — el número ya está en WhatsApp Business del celular |
| Checklist verde en Paso 2 | Meta marca pasos hechos aunque el número siga **ON_PREMISE / DISCONNECTED** |
| QR en "Prueba tu número" | Desplegable vacío = número **no registrado en producción** para la app |
| Menú "Plataforma" en el celular | No siempre visible; coexistencia suele activarse por **Embedded Signup** |

**Coexistencia existe en Chile**, pero Meta **no la muestra** en el asistente "Agregar número". Hay que usar el flujo **Embedded Signup** con `whatsapp_business_app_onboarding`.

---

## Ruta A — Embedded Signup (recomendada)

### 1. Crear configuración en Meta

Embedded Signup **no aparece** como menú suelto. Hay dos rutas:

#### Ruta A — Embedded Signup Builder (más fácil)

1. [developers.facebook.com](https://developers.facebook.com) → app **W API**
2. Panel izquierdo → **WhatsApp** → **Embedded Signup Builder** (o “Generador de registro insertado”)
3. Ahí puedes lanzar el flujo de prueba y ver el `config_id`

Si no ves ese ítem, la app puede no tener el producto correcto (ver Ruta B).

#### Ruta B — Facebook Login for Business

1. En la app **W API** → **Agregar producto** (panel izquierdo abajo)
2. Agrega **Inicio de sesión con Facebook para empresas** / **Facebook Login for Business**
3. Luego: **Facebook Login for Business** → **Configuraciones** / **Configurations**
4. **Crear configuración** (o “Crear desde plantilla” → plantilla *WhatsApp Embedded Signup*)
5. En “variación de inicio de sesión” elige **WhatsApp Embedded Signup**
6. Permisos: `whatsapp_business_management`, `whatsapp_business_messaging`
7. Guarda y copia el **Configuration ID** (`config_id`)

### 2. Abrir la página de vinculación

```powershell
cd rrss/whatsapp-agent
start coexistence-signup.html
```

O abre el archivo en el navegador. Pega el `config_id` y pulsa **Iniciar vinculación**.

### 3. En el flujo de Meta

- Elige **conectar cuenta existente de WhatsApp Business**
- **No** "crear número nuevo"
- Si en el celular llega mensaje de **Facebook Business** → **Conectar** → confirmar

### 4. Verificar

```powershell
node scripts/verify-wa-config.mjs
node -e "import {config} from './lib/config.mjs'; const r=await fetch('https://graph.facebook.com/v25.0/'+config.phoneNumberId+'?fields=status,platform_type,is_on_biz_app',{headers:{Authorization:'Bearer '+config.waToken}}); console.log(await r.json());"
```

Debe mostrar: `status: CONNECTED`, `platform_type: CLOUD_API`, `is_on_biz_app: true`.

---

## Ruta B — Mensaje de Meta en el celular (sin QR)

A veces Meta envía al **WhatsApp Business** del +569 un mensaje de la cuenta oficial **Facebook Business** con:

1. **Conectar a la plataforma empresarial**
2. Código de verificación para pegar en Meta

Revisa chats del +569 (incluidos archivados / solicitudes). No es SMS.

---

## Ruta C — Número dedicado para el bot (plan B operativo)

Si Embedded Signup tampoco aparece (cuenta sin permiso de Tech Provider):

1. Chip o línea **nueva** solo para campañas (ej. otro +56 9…)
2. Registrar ese número **desde cero** en W API (sin error #2655122)
3. Actualizar landing y ads al número nuevo
4. El +569 actual sigue siendo tu WhatsApp manual en el celular

Costo: ~plan prepago. Ventaja: bot operativo en 1 día sin pelear con Meta.

---

## Ruta D — Migración total (no recomendada)

Sacar el +569 del celular y pasarlo 100% a Cloud API. **Pierdes** WhatsApp Business en el bolsillo. Solo si aceptas eso.

---

## Después de coexistencia OK

1. `node scripts/fix-webhook-subscription.mjs`
2. Webhook en Meta: `https://land-advisors-web.onrender.com/webhook`
3. Probar desde otro chip con `[Ref: LA-BUSQ30]`
