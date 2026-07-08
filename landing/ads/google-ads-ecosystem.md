# Ecosistema Google Ads — Land Advisors Chile

**Equipo de diseño:** Performance Marketing · Google Ads · Growth HubSpot · CRO · Copy alto valor · Consultoría estratégica.

**North Star:** Reuniones comerciales calificadas — no clics, no formularios vacíos.

**Regla de oro:** Land Advisors vende **asesoría estratégica territorial**. Nunca debe parecer corredora, portal ni vendedora de proyectos.

---

## 1. Arquitectura por intención

| Landing | Slug | Intención de búsqueda | Servicio puerta | URL |
|---------|------|----------------------|-----------------|-----|
| **A** | `comprar-terreno-sur` | Quiero comprar un terreno en el sur | Diagnóstico 1 UF → Búsqueda 5 UF | `/campanas/comprar-terreno-sur/` |
| **B** | `invertir-terreno-sur` | Quiero invertir / patrimonio / plusvalía | Diagnóstico → Estudio | `/campanas/invertir-terreno-sur/` |
| **C** | `evaluar-terreno-encontrado` | Ya tengo un terreno en vista | Estudio desde 10 UF | `/campanas/evaluar-terreno-encontrado/` |
| **D** | `valorizar-terreno-sur` | Quiero saber si mi terreno vale / valorización | Estudio desde 10 UF | `/campanas/valorizar-terreno-sur/` |
| Promo | `busqueda-personalizada-30` | Oferta promocional búsqueda | Búsqueda 3,5 UF | `/campanas/busqueda-personalizada-30/` |

**Regla:** 1 keyword group → 1 landing → 1 mensaje → 1 CTA dominante.

No enviar tráfico de «comprar terreno» a home ni a `/servicios/` genérico.

---

## 2. Hero — las 4 preguntas (todas las landings intent)

| Pregunta | Función |
|----------|---------|
| ¿Qué problema resuelven? | Dolor en lenguaje del cliente |
| ¿Por qué ustedes? | Diferenciador: consultoría, no corredora |
| ¿Qué gano? | Resultado concreto de la sesión |
| ¿Qué hago ahora? | **Agenda una sesión estratégica** |

Eliminar: historia de la empresa, metodología antes del beneficio, jerga interna.

---

## 3. CTA único

**Copy oficial:** `Agenda una sesión estratégica`

- Botón primario → Google Calendar (`calendar-config.js`)
- WhatsApp solo vía widget flotante / chat (no compite con el CTA hero)
- Tracking: `cta_diagnostico` | `cta_busqueda` | `cta_estudio` según landing

---

## 4. Prueba social (bloque obligatorio)

En cada landing intent:

- **Cifras:** años en cuenca, comunas, clientes desde Santiago
- **Casos reales:** enlace a caso relevante por intención
- **Resultados:** métricas agregadas (26M→42M, +50%, 4.400 UF)
- **Mapa/territorio:** cuenca Lago Llanquihue + Malalcahuello

No inventar testimonios con nombres falsos. Usar citas anónimas solo si provienen de casos documentados.

---

## 5. Microconversiones (lead magnets)

| Landing | Recurso | Destino |
|---------|---------|---------|
| A | Guía: 5 pasos para comprar terreno | `/guias/comprar-terreno-sur-chile/` |
| B | Artículo: plusvalía en contorno rural | `/blog/plusvalia-contorno-rural-puerto-varas/` |
| C | Checklist normativo: PRC y reglamento | `/blog/prc-contorno-rural-puerto-varas/` |
| D | Cambio de uso y valorización | `/blog/cambio-uso-suelo-contorno-rural/` |

Captura: email opcional en fase 2 (HubSpot). Hoy: CTA secundario «Descargar guía» → contenido indexable.

---

## 6. Matriz Google Ads (extracto)

Ver `landing/ads/ads-intents.json` para keyword → landing → UTM → conversión.

### Campaña: LA-SEARCH-COMPRAR (Landing A)

| Keyword (ejemplo) | Match | LP |
|-------------------|-------|-----|
| comprar terreno sur de chile | Phrase | A |
| terreno puerto varas | Phrase | A |
| terreno lago llanquihue | Phrase | A |
| parcela frutillar precio | Phrase | A (anuncio dice *terreno*) |

**Anuncio RSA (esqueleto):**
- H1: Comprar terreno en el sur con criterio
- H2: Consultoría territorial — no corredora
- H3: Sesión estratégica · desde 1 UF
- Desc: ¿Muchos avisos y poca claridad? Filtramos por territorio, normativa y precio real. Agenda tu sesión.

### Campaña: LA-SEARCH-INVERTIR (Landing B)

| Keyword | LP |
|---------|-----|
| invertir terreno sur chile | B |
| inversión inmobiliaria puerto varas | B |
| plusvalía terreno rural | B |

### Campaña: LA-SEARCH-EVALUAR (Landing C)

| Keyword | LP |
|---------|-----|
| evaluar terreno antes de comprar | C |
| due diligence terreno chile | C |
| estudio factibilidad terreno | C |

### Campaña: LA-SEARCH-VALORIZAR (Landing D)

| Keyword | LP |
|---------|-----|
| valorizar terreno rural | D |
| cuanto vale mi terreno | D |
| potencial terreno turismo | D |

---

## 7. UTM estándar

```
utm_source=google
utm_medium=cpc
utm_campaign={campaign_name}
utm_content={ad_group_id}
utm_term={keyword}
```

WhatsApp ref token por landing: `LA-A-COMPRAR`, `LA-B-INVERTIR`, `LA-C-EVALUAR`, `LA-D-VALORIZAR`.

---

## 8. Métricas (HubSpot + GA4)

| Métrica | Objetivo 90 días |
|---------|------------------|
| Tasa conversión LP → reunión agendada | > 8% |
| Rebote en landings intent | < 45% |
| Tiempo en página | > 2:30 min |
| % leads con intent correcto en CRM | > 70% |
| Costo por reunión calificada | TBD post-lanzamiento |

**Eventos GA4:** `generate_lead`, `cta_diagnostico`, `cta_busqueda`, `cta_estudio`, `lead_magnet_click`.

**Google Ads:** configurar `googleAdsConversionId` en `analytics-config.js` → acción «Reunión agendada».

---

## 9. Anti-patrones (no hacer)

- Landing genérica para todas las keywords
- Fotos tipo «lote en venta» como hero principal
- CTA doble competidor (WhatsApp + calendario mismo peso)
- Prometer plusvalía o rentabilidad
- Usar «parcela» en copy (salvo keyword en anuncio con *terreno* en LP)
- Enviar tráfico frío a home de 10 secciones

---

## 10. Implementación técnica

| Artefacto | Path |
|-----------|------|
| Definición landings | `landing/seo/campaigns.json` |
| Generación HTML | `landing/scripts/build-seo.mjs` → `buildCampaignPage()` |
| Estilos | `landing/styles-campaign.css` |
| JS conversión | `landing/campaign-landing.js` |
| Matriz keywords | `landing/ads/ads-intents.json` |

Regenerar: `node landing/scripts/build-seo.mjs`

---

*Última actualización: julio 2026 · Land Advisors Chile*
