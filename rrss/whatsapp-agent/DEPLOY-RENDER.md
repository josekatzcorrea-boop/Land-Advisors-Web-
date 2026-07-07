# Deploy en Render — WhatsApp Agent

## Opción A — Blueprint (recomendada)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
2. Conecta repo `Land-Advisors-Web-`
3. Render detecta `render.yaml` en la raíz
4. Al desplegar, te pedirá:
   - `META_WA_ACCESS_TOKEN` — token permanente (Business Manager → usuario del sistema)
   - `META_WA_PHONE_NUMBER_ID` — por ahora test: `1199304646592446`; producción: ID del +569
5. **Apply** → espera deploy verde
6. Copia la URL: `https://land-advisors-whatsapp.onrender.com`

## Opción B — Web Service manual

| Campo | Valor |
|-------|-------|
| Root Directory | `rrss/whatsapp-agent` |
| Build | `echo ok` |
| Start | `node server.mjs` |
| Health | `/health` |
| Plan | Free |

Variables: ver `render.yaml` y `.env.example`.

## Después del deploy

### 1. Verificar

```
https://TU-SERVICIO.onrender.com/health
```

### 2. Webhook Meta

**Casos de uso** → **WhatsApp** → **Configuración**:

| Campo | Valor |
|-------|-------|
| Callback URL | `https://TU-SERVICIO.onrender.com/webhook` |
| Verify token | `land-advisors-webhook-2026` |

Suscribir **`messages`**.

### 3. Suscribir app al WABA

En local con `.env` apuntando al mismo token:

```bash
node scripts/fix-webhook-subscription.mjs
```

### 4. Apagar local

Cierra `node server.mjs` y `ngrok` — solo Render queda activo.

## Plan free — limitaciones

- El servicio **duerme** tras ~15 min sin tráfico (primer mensaje puede tardar ~1 min).
- `sessions.json` se pierde al redeploy (el usuario puede reenviar mensaje de campaña).
- Para 24/7 sin sleep: plan **Starter** (~USD 7/mes).

## Pasar a número real +56974533265

1. Meta → Paso 2 → agregar número con **Coexistencia**
2. Actualizar `META_WA_PHONE_NUMBER_ID` en Render → redeploy
3. `node scripts/fix-webhook-subscription.mjs`
4. Verificar negocio Meta para tráfico público
