# Estrategia de plataforma — Land Advisors · horizonte 2036

**North Star:** Ser la principal fuente de inteligencia territorial para invertir, comprar o desarrollar en Chile — no una empresa que «presta asesorías».

**Documentos relacionados:** [`estrategia-digital-2046.md`](estrategia-digital-2046.md) (estrategia digital 20 años) · `seo/estrategia-autoridad-2026.md` (SEO fases 1–4) · `data/rag-analisis-cuenca-2026.md` (datos RAG) · `seo/ila-index.json` (ILA v0) · `seo/schemas/`

---

## 1. Tesis estratégica

| Hoy | Objetivo 2036 |
|-----|---------------|
| Consultoría de servicios | Plataforma de inteligencia territorial |
| Valor en horas del consultor | Valor en datos + índices + estudios acumulados |
| Blog como marketing | Biblioteca indexada + observatorio citabile |
| Casos como storytelling | Casos como módulos que calibran herramientas |

**Criterio de inversión en cada activo:**

> ¿Será mucho más difícil copiar Land Advisors en 5 años si desarrollamos esto?

**Flywheel:** estudio / caso / visita → LAKG → ILA + mapa + herramientas → autoridad → usuarios → más datos de campo.

---

## 2. Siete activos digitales

### 2.1 Índice Land Advisors (ILA)

Score 0–100 por **sector** (unidad ~500 m – 2 km), no por comuna.

**Fórmula:** `ILA = Σ (peso_perfil × variable_normalizada)`

| Dimensión | Peso base | Fuentes |
|-----------|-----------|---------|
| Conectividad real | 25% | Campo LA + OSM |
| Vocación normativa | 25% | RAG PRC / PLADECO |
| Demografía y demanda | 20% | Censo 2017→2024 |
| Mercado y liquidez | 20% | Comparables LA |
| Riesgo habilitación | 10% | SIG + casos |

**Perfiles que reponderan:** patrimonio · turismo · comercial · desarrollo.

**Implementación v0:** `seo/ila-index.json` · página `/indice-territorial/`

### 2.2 Plataforma cartográfica

Exploración por tesis, no por pin de aviso.

**Capas MVP → escala:** límite urbano · isócronas · demografía · riesgo ambiental · parcelaciones · comparables (clientes).

**Stack objetivo:** PostGIS + MapLibre + API GraphQL.

### 2.3 Herramientas (solo con datos LA)

| Herramienta | Moat |
|-------------|------|
| Costo total habilitación | Coeficientes de casos reales |
| Comparador territorial | Perfil-aware + ILA |
| Simulador valor presente vs. futuro | Modelo caso Llanquihue |
| Checklist pre-oferta | Mejora con cada visita |
| Evaluador de aviso | RAG normativo propio |

**Eliminar:** calculadoras genéricas, portal de listings, chatbot sin LAKG.

### 2.4 Biblioteca (centro de conocimiento)

**Taxonomía 3 ejes:** territorio · tipo de conocimiento · etapa del comprador.

**Schema:** `seo/schemas/knowledge-item.schema.json`

**Clusters:** contorno rural · comparar comunas · normativa · desde Santiago · turismo · observatorio · comprar mejor · casos.

### 2.5 Estudios y observatorio

| Producto | Frecuencia |
|----------|------------|
| Observatorio Cuenca Llanquihue | Anual |
| Ranking sectores por perfil | Anual |
| Índice presión urbanizadora | Trimestral |
| Alertas normativas | Event-driven |

**Piloto 2026:** `seo/observatorio-2026.json`

### 2.6 Casos — schema v2

Campos ILA obligatorios en nuevos casos: `sectorId`, `profile`, `dimensionsValidated`, `thesisMarket`, `thesisTerritory`.

**Schema:** `seo/schemas/case-study-v2.schema.json`

### 2.7 Land Advisors Knowledge Graph (LAKG)

```
Capa 5 — Outcomes (casos, reventas)
Capa 4 — Campo (visitas, tiempos)     ← máximo moat
Capa 3 — Mercado (avisos, transacciones)
Capa 2 — Normativa (PRC vectorizado)
Capa 1 — Público (Censo, CASEN, OSM)
```

**Regla:** cada diagnóstico (1 UF) aporta ≥5 datapoints al sector.

---

## 3. Hoja de ruta

### Fase 0 — Fundación (Q3–Q4 2026) ← **estamos aquí**

- [x] Documentación estrategia + schemas
- [x] ILA v0 (16 sectores cuenca)
- [x] Página `/indice-territorial/`
- [x] Observatorio piloto 2026
- [x] Casos con metadatos ILA
- [x] **Land Advisors Brain** (`brain/`) — LAKG operativo interno
- [ ] Ingesta Censo 2024 → PostGIS
- [ ] Vectorizar PRC Puerto Varas

### Fase 1 — Producto (2027)

Observatorio anual #1 · herramientas habilitación + comparador · alertas normativas · mapa 5 capas interactivo.

### Fase 2 — Escala Los Lagos (2028–29)

Osorno · Castro · Malalcahuello profundo · API B2B agregada · serie ILA histórica.

### Fase 3 — Chile (2030–32)

Corredores segunda vivienda · certificación metodología LA · licensing datos.

### Fase 4 — Moat (2033–36)

10 años de series · modelo predictivo urbanización · referencia académica/regulatoria.

---

## 4. Modelo de negocio

| Capa | Qué |
|------|-----|
| Gratis | ILA resumido · mapa básico · biblioteca · observatorio ejecutivo |
| Transaccional | Diagnóstico 1 UF · búsqueda 5 UF · estudios 10+ UF |
| Suscripción | Alertas ILA + normativa (inversionistas) |
| B2B | API agregada · informes white-label |

---

## 5. Qué NO construir

Portal de avisos · IA recomendadora sin datos propios · SEO sin dato · expansión geográfica sin observatorio local · más servicios sin captura LAKG.

---

## 6. Próximos 90 días (operativo)

1. Polígonos definitivos 20 sectores LA
2. Script ingestión `RAG/Demografia/` → base estructurada
3. ILA v0.2 con confianza A en sectores visitados
4. Checklist pre-oferta interactivo (MVP)
5. Extender `build-seo.mjs` con `KnowledgeItem` indexado

---

*Última actualización: julio 2026 · Fuente datos: `seo/*.json` · Build: `node landing/scripts/build-seo.mjs`*
