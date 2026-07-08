# Estrategia de autoridad territorial — Land Advisors Chile · 2026

**North Star:** Ser la fuente más confiable de Chile sobre cómo decidir bien al comprar terreno — no sobre dónde comprar un aviso.

**Posicionamiento:** Consultoría de inteligencia territorial. No corredora. No portal.

---

## Cuatro pilares

| Pilar | Hub | Estado |
|-------|-----|--------|
| 1. Comprar mejor | `/guias/` | Activo — flagship |
| 2. Inteligencia territorial | `/blog/` + `/territorios/` | Serie contorno rural (en curso) |
| 3. Inversión y valorización | `/blog/` (plusvalía, costos) | Activo |
| 4. Casos y aprendizajes | `/casos-de-estudio/` + casos individuales | Fase 1 implementada |

---

## Clusters activos

```
/guias/  (Pilar 1)
  ├── blog/plusvalia-contorno-rural-puerto-varas/  (serie pt. 1)
  ├── blog/costos-habilitacion-terreno-contorno-rural/  (serie pt. 2)
  ├── casos-de-estudio/puerto-varas-restriccion-comercial/
  ├── casos-de-estudio/frutillar-brecha-precio/
  └── casos-de-estudio/llanquihue-valor-presente-futuro/
```

**Retirados (redirect):**
- `expansion-urbana-contorno-rural-oportunidades` → plusvalía (contenido fusionado)
- `mercado-inmobiliario-sur-chile-inversionistas` → `/guias/` (contenido en guía)

---

## Checklist EEAT (obligatorio por pieza)

- [ ] Autor: José Hernán Katz C. + enlace `#nosotros`
- [ ] `datePublished` + `dateModified` visibles
- [ ] Disclaimer educativo (no promesa de rentabilidad)
- [ ] 1 ejemplo territorial real o caso anonimizado
- [ ] FAQ al final (mín. 3 preguntas en casos y guías)
- [ ] Schema: BlogPosting / Article / CaseStudy según tipo
- [ ] ≥5 enlaces internos (hub + lateral + caso/servicio)

---

## Roadmap

### Fase 1 — jul 2026 ✓
- Casos individuales con template completo
- Fusiones blog redundante
- EEAT byline en guía y blog
- Hub casos actualizado

### Fase 2 — jul 2026 ✓
- Serie contorno rural parts 3–5 (PRC, conectividad, vocación)
- Puerto Varas enriquecido (~1.500 palabras + FAQ)
- Hub `/inteligencia-territorial/`
- Página `/servicios/asesoria-compra/`

### Fase 3 — dic 2026–jun 2027
- Contenido nacional «desde Santiago»
- Guest experts (notario, arquitecto)
- Actualización trimestral de hubs

---

## Puente RRSS → SEO

| Formato RRSS | Destino orgánico |
|--------------|------------------|
| Carrusel educativo (E) | Artículo cluster |
| Single (S) | `/guias/` o servicio |
| Aliado (A) | Caso de estudio |
| Reel conectividad | Futuro: conectividad real |

---

## KPIs (6 meses)

- 15+ keywords top 10 (intención compra terreno sur)
- 80% artículos >2 min tiempo en página
- Tráfico orgánico +150%
- Formularios con `utm_source=blog` medibles en GA4

---

*Fuente operativa: `landing/seo/*.json` · Generación: `node landing/scripts/build-seo.mjs`*
