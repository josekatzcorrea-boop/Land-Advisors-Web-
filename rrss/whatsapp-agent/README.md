# Agente WhatsApp — Land Advisors (campaña búsqueda 30%)

Embudo: **Meta Ads** → landing → **WhatsApp** → agente filtra → **reunión** → pago.

## Archivos

| Archivo | Uso |
|---------|-----|
| `server.mjs` | Webhook WhatsApp Cloud API (producción) |
| `lib/flow-engine.mjs` | Motor de estados y calificación |
| `lib/wa-send.mjs` | Envío mensajes Graph API |
| `lib/notify-jose.mjs` | Notificación lead a José (CallMeBot) |
| `flow.json` | Máquina de estados y reglas de calificación |
| `messages.json` | Textos del agente |
| `SETUP-META-API.md` | **Guía paso a paso** Meta Developers + deploy |
| `system-prompt.md` | Referencia tono aliado (flujo actual es determinístico) |

## Flujo resumido

```
Mensaje entrante (desde landing / ads)
        ↓
   welcome — saludo + contexto promo
        ↓
   objective — ¿qué quieres hacer con el terreno?
        ↓
   budget — rango UF compra terreno
        ↓
   zone — Puerto Varas, Frutillar, etc.
        ↓
   timeline — plazo compra
        ↓
   location — RM / norte / sur
        ↓
   qualify (interno)
    ├─ fit → offer_summary → calendario
    ├─ explorando → nurture → calendario diagnóstico
    ├─ fuera territorio → not_fit
    └─ palabra clave → human_escalation → José
```

Calendario: https://calendar.app.google/NnBG8xc4b2HbByu67  
Teléfono: +56 9 7453 3265

---

## Arranque rápido (Cloud API — implementado)

```bash
cd rrss/whatsapp-agent
cp .env.example .env
# Completar META_WA_* en .env
npm run verify
npm start
```

Configurar webhook en Meta según **`SETUP-META-API.md`**.

---

## Otras opciones (referencia)

### Opción A — ManyChat + IA

1. Cuenta **WhatsApp Business** en el número +56974533265 (o migrar a Cloud API).
2. [manychat.com](https://manychat.com) → conectar WhatsApp.
3. Crear flujo **Default Reply** + keyword `búsqueda`, `oferta`, `3,5`.
4. Copiar mensajes de `messages.json` en cada paso; quick replies según `flow.json`.
5. Paso `qualify`: usar **ManyChat AI** con `system-prompt.md` pegado en instrucciones.
6. Acción final: etiqueta `lead-busqueda-30` + notificación email/Telegram a José.

**Ventaja:** sin servidor propio. **Desventaja:** costo mensual ManyChat Pro.

### Opción B — Meta WhatsApp Cloud API ✅ (esta carpeta)

Ver **`SETUP-META-API.md`** — incluye token permanente, webhook, deploy Railway/Render y pruebas.

### Opción C — Semiautomático (mientras tanto)

1. **Respuestas rápidas** en WhatsApp Business con textos de `messages.json`.
2. **Etiquetas:** `lead-busqueda-30`, `reunión-agendada`, `no-fit`.
3. José responde manualmente siguiendo `flow.json` como guion.

Útil las primeras 2 semanas con poco volumen de ads.

---

## Mensaje de entrada desde la landing

La campaña prellena:

```
Hola, vi la oferta de Búsqueda personalizada (30% dto., válida hasta 30 de septiembre). Me interesa saber si aplica para mi caso.
```

El agente debe **reconocer** este texto y saltar directo a `ask_objective` (o welcome corto + objective).

---

## Notificación a José (lead calificado)

Cuando `handoff_tagged` o `human_escalation`, enviar resumen:

```
🔔 Lead campaña búsqueda 30%
Nombre: {nombre}
Objetivo: {objective}
Presupuesto: {budgetUf}
Zona: {zoneInterest}
Plazo: {timeline}
Ubicación: {buyerLocation}
UTM: {utm_campaign}
→ Agendar: https://calendar.app.google/NnBG8xc4b2HbByu67
```

Reutilizar `landing/scripts/whatsapp-proxy.gs` (CallMeBot) solo para **notificaciones salientes** a José — no para el chat bidireccional con el cliente.

---

## Próximo paso técnico

1. Completar `.env` y seguir **`SETUP-META-API.md`**
2. Desplegar en Railway/Render con HTTPS
3. Suscribir webhook `messages` en Meta Developers
4. Probar desde otro teléfono con el mensaje prellenado de la landing

## Prueba del flujo (manual)

Simula en WhatsApp Business con otro teléfono:

1. Envía el mensaje prellenado de la landing.
2. Completa las 5 preguntas.
3. Verifica que llega resumen de oferta + link calendario.
4. Caso "Solo explorando" → mensaje nurture, sin presión.
5. Caso "Otra zona del sur" → not_fit amable.
