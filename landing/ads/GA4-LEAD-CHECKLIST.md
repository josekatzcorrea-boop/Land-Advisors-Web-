# GA4 — Checklist leads (BUSQ30 / sitio)

El código ya dispara los eventos. Solo verifica en la consola:

## 1. Evento clave

1. Abre [GA4](https://analytics.google.com/) → propiedad Land Advisors (`G-F09P7G5WZK`).
2. **Admin** → **Eventos**.
3. Marca **`generate_lead`** como **evento clave** (si aún no lo está).

Origen en sitio: `form_success` (formulario BUSQ30) y varios CTAs mapean a `generate_lead` vía [`landing/analytics.js`](../analytics.js).

## 2. Google Ads (si aplica)

1. En Ads → **Objetivos** → **Conversiones**.
2. Confirma que la conversión importada desde GA4 (o el tag `AW-18311759633`) recibe leads.
3. No hace falta un evento nuevo por el cambio de copy de CTAs.

## 3. Prueba rápida

1. Abre `/campanas/busqueda-personalizada-30/`.
2. Completa y envía el formulario (puedes usar datos de prueba).
3. En GA4 → **Admin** → **DebugView** (o **Tiempo real**): busca `generate_lead` / `form_success`.
4. En Meta Events Manager: confirma evento **Lead** del Pixel `1067824015463958`.

## Qué no hacer

- No crear eventos custom solo porque el botón diga “Agendar diagnóstico” en lugar de “reunión estratégica”.
- No marcar `cta_lead_form` (scroll al form) como conversión; el lead real es el envío del formulario.
