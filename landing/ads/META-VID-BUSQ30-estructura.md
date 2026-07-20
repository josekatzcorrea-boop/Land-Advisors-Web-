# Meta Ads — Estructura exacta · Video BUSQ30 (form → WhatsApp)

**Presupuesto:** $100.000 CLP · Solo Meta  
**Creativo:** Video José a cámara (`0716.mp4` / META-ADV-001 · ~25 s)  
**Oferta:** Diagnóstico estratégico **gratis** → búsqueda 3,5 UF opcional  
**Válido hasta:** 30 septiembre 2026  
**Fecha estructura:** 20 jul 2026  

---

## Flujo de conversión (obligatorio)

```
Anuncio Meta → Landing BUSQ30 → Tabla LA vs corredora → Formulario → Gracias + WhatsApp (+ Agendar reunión)
```

- **Destino del anuncio:** siempre la landing (nunca Click-to-WhatsApp como destino principal).
- **Conversión Pixel / evento de optimización:** `Lead` = envío del formulario (`form_success` → `generate_lead` / Meta `Lead`).
- **Post-form:** abre WhatsApp (`wa.me/56974533265`) con mensaje prefabricado `LA-BUSQ30` + datos del lead; notificación a José vía webhook.
- **Paralelo:** CTA **Agendar reunión** (calendario Google) en hero y en pantalla de éxito.

---

## 1. Jerarquía (copiar tal cual en Ads Manager)

```
Cuenta publicitaria: Land Advisors Chile
│
└── Campaña
    Nombre: LA-META-VID-BUSQ30-2026Q3
    Objetivo: Leads
    Preferido: Leads → Destino: Sitio web
    Advantage+ budget campaña: NO (control manual)
    │
    └── Conjunto de anuncios
        Nombre: AS-CL-SANTIAGO-30-55-LEADS
        │
        ├── Anuncio A (principal)
        │   Nombre: AD-META-ADV-001-25s-A
        │
        └── Anuncio B (variante, si hay corte alternativo)
            Nombre: AD-META-ADV-001-25s-B
```

---

## 2. Campaña

| Campo | Valor exacto |
|-------|----------------|
| **Nombre** | `LA-META-VID-BUSQ30-2026Q3` |
| **Objetivo** | **Leads** |
| **Configuración de conversión** | Sitio web |
| **Evento de conversión** | `Lead` (Pixel `1067824015463958`) — disparado al **enviar el formulario** |
| **Presupuesto** | A nivel de **conjunto** (no Advantage+ campaign budget) |
| **Special ad categories** | Ninguna (consultoría, no venta de vivienda propia). Si Meta fuerza Housing, marcar solo si aplica. |
| **iOS 14+** | Dominio `landadvisors.cl` verificado en Business Manager |

---

## 3. Conjunto de anuncios

| Campo | Valor exacto |
|-------|----------------|
| **Nombre** | `AS-CL-SANTIAGO-30-55-LEADS` |
| **Conversión** | Sitio web → evento **Lead** |
| **Presupuesto diario** | **$7.000 CLP / día** (~14 días = ~$98.000) |
| **Programación** | Empieza hoy · termina al agotar tope $100.000 |
| **Optimización** | Conversiones · Evento: Lead |
| **Puja** | Lowest cost · **sin** tope de puja al inicio |
| **Ventana de atribución** | 7 días clic · 1 día vista (default Meta) |

### Audiencia

| Campo | Valor |
|-------|--------|
| **Ubicaciones** | Chile |
| **Detalle geográfico** | Priorizar **Región Metropolitana** + **Los Lagos** |
| **Edad** | **32 – 58** |
| **Género** | Todos |
| **Idioma** | Español |
| **Advantage+ audience** | **OFF** la primera semana; si a los 5 días hay <5 leads → ON |
| **Intereses (stack)** | Bienes raíces · Inversión · Compra de vivienda · Vida rural / sur de Chile |
| **Colocaciones** | Advantage+ placements ON (video) · o Feed + Reels + Stories |
| **Dispositivos** | Todos |

---

## 4. Anuncio (video)

### AD-A — versión principal (~25 s)

| Campo | Valor exacto |
|-------|----------------|
| **Nombre** | `AD-META-ADV-001-25s-A` |
| **Formato** | Video único |
| **Video** | `0716.mp4` vertical 9:16 (1080×1920) · subtítulos quemados |
| **Miniatura** | Frame “Diagnóstico GRATIS” o cover existente |
| **Página / Instagram** | Land Advisors Chile · @landadvisorschile |
| **URL del sitio** | ver sección 5 |
| **CTA botón** | **Más información** (preferido) o **Reservar ahora** — ambos a la **landing**, no a WA |
| **Pixel** | `1067824015463958` |

### Textos del anuncio A (copiar/pegar)

**Texto principal**

```
¿Buscas terreno en Puerto Varas, Frutillar o Llanquihue?

Yo no soy corredor — soy consultor. Trabajo para ti (el comprador), no para el propietario que vende.

Promoción hasta el 30 de septiembre:
→ Diagnóstico estratégico GRATIS (sin compromiso)
→ Si te sirve, búsqueda personalizada a 3,5 UF (antes 5 UF)

Cuéntanos qué buscas en la web y seguimos por WhatsApp 👇
```

**Titular**

```
Diagnóstico estratégico gratis
```

**Descripción**

```
Sin compromiso · Hasta 30 sept · Land Advisors
```

### AD-B — variante (opcional)

**Texto corto**

```
¿Terreno en el sur y no sabes por dónde empezar?

Diagnóstico estratégico GRATIS hasta el 30 de septiembre.
Sin compromiso. Consultor del comprador — no corredora.

Completa el formulario y conversamos por WhatsApp 👇
```

---

## 5. URLs (obligatorias)

**Destino principal (landing promo):**

```
https://www.landadvisors.cl/campanas/busqueda-personalizada-30/?utm_source=meta&utm_medium=paid&utm_campaign=busqueda-30-sep2026&utm_content=meta-adv-001-25s
```

**Variante AD-B:**

```
https://www.landadvisors.cl/campanas/busqueda-personalizada-30/?utm_source=meta&utm_medium=paid&utm_campaign=busqueda-30-sep2026&utm_content=meta-adv-001-25s-b
```

### CTAs en la landing (no configurar como destino del anuncio)

| CTA | Destino |
|-----|---------|
| **WhatsApp** (hero / nav / flotante) | Scroll al formulario `#campaign-lead` |
| **Enviar y abrir WhatsApp** | Form → `wa.me/56974533265` con datos del lead + `[Ref: LA-BUSQ30]` |
| **Agendar reunión** | `https://calendar.app.google/NnBG8xc4b2HbByu67` |

> **No** uses Click-to-WhatsApp como destino principal de este presupuesto. Mide **Lead** = envío de formulario.

---

## 6. Tracking (qué cuenta como lead)

| Evento | Cuándo | Pixel Meta | GA4 |
|--------|--------|------------|-----|
| `form_success` | Formulario enviado (nombre, correo, objetivo, presupuesto UF) | **Lead** | `generate_lead` |
| `cta_calendar` | Clic en Agendar reunión | Schedule | `generate_lead` |
| `cta_whatsapp` | “Continuar por WhatsApp” post-form | Contact | `generate_lead` |
| `cta_lead_form` | Clic WhatsApp que solo baja al form | — (engagement) | custom |

Notificación a José: webhook `whatsapp-config.js` al enviar el form.

---

## 7. Presupuesto día a día ($100.000)

| Concepto | Monto |
|----------|-------|
| Presupuesto diario | **$7.000** |
| Días teóricos | ~14 |
| Total | **~$98.000** |
| Buffer | ~$2.000 |

**Regla de corte:**
- Día 5: si **0 leads** (form) → Advantage+ ON o cambia creativo/texto.
- Día 7: si **CPL > $25.000** → pausa peores anuncios.
- Día 14 o $100.000 → **pausa** y evalúa.

---

## 8. KPIs de esta corrida

| KPI | Meta razonable con $100k |
|-----|---------------------------|
| Leads (formulario enviado) | **4 – 10** |
| CPL objetivo | **$10.000 – $25.000** |
| CTR (link) | **> 0,8%** en video |
| Conversaciones WA / reuniones | **2 – 5** |

---

## 9. Checklist pre-publicación

1. [ ] Video 9:16 (~25 s) con subtítulos · sonido OK  
2. [ ] Pixel recibe PageView + prueba evento **Lead** (enviar form de prueba en Events Manager)  
3. [ ] Dominio `landadvisors.cl` verificado  
4. [ ] Landing: tabla comparativa + form + éxito WA + calendario OK  
5. [ ] Destino anuncio = URL BUSQ30 (sección 5) — **no** wa.me  
6. [ ] CTA botón Meta: **Más información** / **Reservar ahora**  
7. [ ] Presupuesto $7.000/día · tope $100.000  
8. [ ] Primeras 72 h: no editar creativo/audiencia a diario  

---

## 10. Qué NO hacer

- No Click-to-WhatsApp como destino principal  
- No mandar a la home genérica — siempre **BUSQ30**  
- No optimizar a “Tráfico” si Lead del Pixel ya funciona  
- No comparar honorarios LA vs corredora en el creativo (diferenciación = para quién trabajas)  

---

## Referencias del proyecto

- Landing: `/campanas/busqueda-personalizada-30/`
- Video fuente: `rrss/video/0716.mp4` → `landing/videos/promo-busq30.mp4`
- Pixel / GA4: `landing/analytics-config.js`
- WA notify: `landing/whatsapp-config.js`
- Calendario: `landing/calendar-config.js`
