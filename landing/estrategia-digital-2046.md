# Estrategia digital — Land Advisors Chile · horizonte 2046

**North Star 2046:** Cuando alguien en Chile piensa en comprar, invertir o desarrollar en territorio — especialmente fuera de Santiago — consulta Land Advisors **antes** que un portal, una corredora o un asesor aislado.

**Qué NO somos:** corredora · inmobiliaria · portal · catálogo de avisos.

**Qué somos:** plataforma de inteligencia territorial para la toma de decisiones inmobiliarias.

---

## Documentos del sistema estratégico

| Documento | Horizonte | Foco |
|-----------|---------|------|
| **Este archivo** (`estrategia-digital-2046.md`) | 20 años | Productos, ingresos, plataformas, comunidad, métricas |
| [`estrategia-plataforma-2036.md`](estrategia-plataforma-2036.md) | 10 años | ILA, LAKG, mapa, observatorio, roadmap técnico |
| [`seo/estrategia-autoridad-2026.md`](seo/estrategia-autoridad-2026.md) | 12 meses | SEO, hubs, EEAT, puente RRSS |
| [`data/rag-analisis-cuenca-2026.md`](data/rag-analisis-cuenca-2026.md) | Datos | Censo 2024 + normativa RAG (calibración) |
| [`seo/ila-index.json`](seo/ila-index.json) | Producto v0 | 16 sectores ILA en producción |

---

## 1. Balance de activos estratégicos

Toda iniciativa digital debe aumentar **al menos dos** de estos ocho activos:

| Activo | Definición operativa | Cómo se mide |
|--------|----------------------|--------------|
| **Autoridad** | Ser citados como referencia | Menciones, backlinks, citas observatorio |
| **Propiedad intelectual** | Metodologías e índices registrables | Marcas, white papers, fórmulas LA™ |
| **Datos** | Capa propietaria verificada | Datapoints LAKG, sectores confianza A |
| **Comunidad** | Red que aporta y consume inteligencia | Miembros Circle, asistencia mesas |
| **Contenido** | Evidencia en el grafo, no posts sueltos | Nodos LAKG enlazados |
| **Herramientas** | Self-serve que califica y calibra | Usos/mes, informes generados |
| **Reputación** | Confianza sin promesa de rentabilidad | NPS, testimonios cualificados |
| **Escalabilidad** | Valor sin horas lineales del fundador | % ingreso recurrente, API B2B |

### Filtro de inversión (obligatorio)

Antes de construir cualquier funcionalidad:

1. ¿Hace la empresa **más difícil de copiar** en 5 años?
2. ¿Aumenta el **valor acumulado** del conocimiento?
3. ¿Reduce la **dependencia de personas**?
4. ¿Genera un **activo reutilizable**?

Si alguna respuesta es **no** → no se construye (aunque suba conversión web).

---

## 2. Arquitectura de plataformas

Una marca · un grafo de datos (LAKG) · múltiples productos.

| Plataforma | Rol | Estado | Horizonte live |
|------------|-----|--------|----------------|
| **landadvisors.cl** | Autoridad, distribución, conversión calificada | Activo | Siempre |
| **Atlas LA** | Mapa + capas + exploración por tesis | Diseño | 2027 |
| **Observatorio LA** | Informes, rankings, descargas, alertas | Piloto 2026 | 2027 |
| **Tools LA** | Calculadoras, checklist, evaluador aviso | Diseño | 2027–28 |
| **Circle LA** | Membresía, mesas, benchmarks | Concepto | 2029 |
| **API LA** | Datos agregados B2B | Concepto | 2030+ |
| **Academy LA** | Certificación Territory Analyst | Concepto | 2032+ |

**Sistema interno (operativo):** [`brain/`](../brain/) — Next.js + Supabase + pgvector + copiloto RAG.

**Principio:** la web no es el producto. Es la **capa de distribución** del índice, el mapa y el observatorio.

---

## 3. Catálogo de productos digitales

### 3.1 Índices (propiedad intelectual)

| Producto | Sigla | Descripción | Moat |
|----------|-------|-------------|------|
| Índice Land Advisors | **ILA** | Score 0–100 por sector y perfil | Campo + series temporales |
| Índice Presión Territorial | **IPT** | Urbanización, parcelaciones, permisos | Actualización trimestral propia |
| Índice Liquidez Contorno | **ILC** | Días mercado, spread lista/transacción | Datos no públicos en portales |
| Índice Riesgo Habilitación | **IRH** | Costo y plazo modelado por sector | Coeficientes de casos reales |
| Ranking anual | — | «Dónde decidir en el sur» por perfil | Marca + PR + citabilidad |

**Metodología registrable:** *Land Advisors Territorial Decision Framework™* — principios públicos, calibración propietaria cerrada.

**Implementación actual:** ILA v0 → [`/indice-territorial/`](indice-territorial/) · fuente [`seo/ila-index.json`](seo/ila-index.json)

### 3.2 Herramientas de decisión

| Herramienta | Entrada | Salida | Residuo LAKG |
|-------------|---------|--------|--------------|
| Costo total habilitación | Precio + sector | Rango UF + alertas | Coeficientes sector |
| Simulador valor presente vs. futuro | Loteo + costos pendientes | Semáforo + escenarios | Calibración IRH |
| Checklist pre-oferta | 40 ítems | Score + qué validar legal | Patrones de riesgo |
| Evaluador de aviso | URL / PDF | Flags normativos + ILA sector | Corpus avisos |
| Comparador territorial | 3 sectores | Radar 5 ejes ILA | Preferencias perfil |
| Matriz cambio de uso | Comuna + objetivo | Viabilidad estimada | Grafo normativo |

**Modelo:** capa gratuita limitada → informe / diagnóstico / suscripción.

### 3.3 Observatorios

| Observatorio | Audiencia | Cadencia |
|--------------|-----------|----------|
| Cuenca Lago Llanquihue | Compradores, inversión | Anual |
| Corredores segunda vivienda Chile | Nacional | Anual |
| Presión urbanizadora Los Lagos | Desarrolladores, municipios | Trimestral |
| Normativa que cambia el juego | Abogados, compradores | Event-driven |
| Turismo inmobiliario cordillera | Inversionistas | Anual |

**Piloto 2026:** [`seo/observatorio-2026.json`](seo/observatorio-2026.json) · sección en [`/indice-territorial/#observatorio-2026`](indice-territorial/)

**Regla:** cada informe mueve una variable de índice o documenta cambio estructural. Opinión sin dato = no observatorio.

### 3.4 Land Advisors Knowledge Graph (LAKG)

Capas (de abajo arriba):

1. Público — Censo, CASEN, OSM, satélite  
2. Normativa — PRC/PLADECO vectorizado + RAG  
3. Mercado — avisos, transacciones, días en mercado  
4. Campo — visitas, tiempos reales, media geo (**máximo moat**)  
5. Outcomes — casos, reventas, post-mortem  

**Regla operativa:** cada diagnóstico (1 UF) → ≥5 datapoints al sector · cada estudio (10+ UF) → predio completo en LAKG.

**Schema unificado:** [`seo/schemas/knowledge-item.schema.json`](seo/schemas/knowledge-item.schema.json)

### 3.5 Comunidad y certificación

| Producto | Descripción |
|----------|-------------|
| **Circle LA** | 50–200 miembros: inversionistas, family offices, desarrolladores serios |
| **Mesa territorial trimestral** | Observatorio + Q&A (online) |
| **Certificación metodología LA** | Sello en proyectos/loteos (B2B, no corretaje) |
| **Territory Analyst** | Formación + licencia metodología |

### 3.6 Metodologías registrables (PI)

| Marca | Uso |
|-------|-----|
| Territorio primero, activo después™ | Secuencia de decisión |
| ILA™ | Índice territorial |
| Due diligence rural LA™ | Checklist y pesos |
| Valor presente vs. futuro™ | Modelo loteos medio urbanizar |
| Tres anillos™ | Ciudad / contorno / campo |

---

## 4. Modelos de ingreso

### Cuatro motores (no excluyentes)

| Motor | Ejemplos | Activos que alimenta |
|-------|----------|----------------------|
| **Inteligencia (recurrente)** | Suscripción observatorio, alertas ILA/IPT, API agregada | Datos, autoridad, escalabilidad |
| **Decisión (transaccional)** | Diagnóstico 1 UF, búsqueda 5 UF, estudio 10+ UF | Casos, metodología, campo |
| **Infraestructura (B2B)** | White-label, certificación, licensing histórico | Reputación, PI, escalabilidad |
| **Red (comunidad)** | Circle LA, mesas, benchmarks exclusivos | Comunidad, datos, autoridad |

### Matriz producto × ingreso × activo

| Producto | Gratis | Transaccional | Suscripción | B2B | Activos principales |
|----------|--------|---------------|-------------|-----|---------------------|
| ILA resumido | ● | | ● | ● | Autoridad, datos, PI |
| ILA predio específico | | ● | | ● | Datos, escalabilidad |
| Observatorio ejecutivo | ● | | ● | ● | Autoridad, contenido |
| Observatorio completo | | ● | ● | ● | Datos, PI |
| Atlas LA (mapa) | capa básica | | ● | ● | Herramientas, datos |
| Checklist / calculadoras | limitado | ● | ● | | Herramientas, datos |
| Casos publicados | ● | | | | Autoridad, contenido |
| Certificación LA | | | | ● | Reputación, PI |
| Circle LA | | | ● | | Comunidad |
| Academy / Analyst | | | | ● | PI, escalabilidad |

### Lo que NO se monetiza

- Listados de propiedades  
- Comisión por corretaje  
- Venta de leads a terceros  
- Contenido alarmista solo para tráfico  

---

## 5. Experiencias por perfil de cliente

### Comprador desde Santiago (prioritario web)

```
Ranking / observatorio → Mapa ILA → Checklist o evaluador
  → Diagnóstico (informe digital + reunión opcional)
  → Búsqueda en plataforma → Decisión documentada (caso opt-in)
```

**Promesa:** decidir mejor *antes* de la visita.

### Inversionista patrimonial (1.000–5.000 UF)

```
Suscripción + alertas → Series ILA/ILC → Estudio bajo demanda → Circle
```

### Desarrollador / loteador

```
Certificación metodología LA → Informe IPT/ILC para inversores del proyecto
  → API agregada en ficha (sin corretaje)
```

### B2B (abogados, wealth, bancos)

```
API agregada + informes white-label → Training Territory Analyst
```

---

## 6. Lista de destrucción creativa

| Rechazar | Motivo |
|----------|--------|
| Portal de avisos | Commodity; destruye posicionamiento |
| SEO genérico sin dato propio | Replicable por IA |
| Chatbot sin LAKG | Riesgo reputacional |
| Calculadoras hipoteca/UF genéricas | Cero moat territorial |
| Expansión geográfica sin observatorio local | Dilución de marca |
| Más consultores sin captura LAKG | Ingresos lineales |
| Rediseño visual sin producto | Bonito ≠ difícil de copiar |

---

## 7. Olas estratégicas 2026–2046

### Ola 1 — Fundación (2026–2028): *La fuente de la cuenca*

- ILA v1: 100+ sectores Los Lagos  
- IPT piloto  
- Atlas LA MVP (5 capas)  
- Observatorio anual #1 con citas en prensa  
- LAKG operativo (regla 5 datapoints/diagnóstico)  
- 2 herramientas calibradas (habilitación + checklist)  
- Suscripción alertas normativas piloto  

### Ola 2 — Producto (2029–2033): *Estándar regional*

- Series ILA históricas  
- Observatorios por corredor  
- API B2B beta  
- Circle LA (~100 miembros)  
- Certificación metodología LA  
- Academy piloto  

### Ola 3 — Chile (2034–2039): *Infraestructura de decisión*

- ILA nacional por corredores  
- Licensing institucional  
- Modelo predictivo urbanización  
- Citación en política pública o regulación  

### Ola 4 — Moat (2040–2046): *Imposible sin historia*

- 20 años de series + outcomes  
- Red de analistas certificados  
- Estándar de due diligence rural  
- Alianzas estratégicas (datos, no corretaje)  

---

## 8. Métricas que importan

| Métrica | Meta orientativa |
|---------|------------------|
| Datapoints LAKG / mes | Crecimiento sostenido |
| Sectores confianza A | >40% ILA v1 |
| Citas externas observatorio | ≥3 medios/año |
| % ingreso recurrente | >25% en 2030 |
| Leads que mencionan ILA/observatorio | >30% en 2027 |
| Outcomes documentados / año | ≥6 casos estructurados |
| NPS «aprendí a pensar territorialmente» | >50 |

**No optimizar:** pageviews aislados, likes, «terrenos mostrados».

---

## 9. Priorización Q3–Q4 2026 (operativo)

Alineado con [`estrategia-plataforma-2036.md`](estrategia-plataforma-2036.md) Fase 0.

| # | Entrega | Activo | Responsable | Estado |
|---|---------|--------|-------------|--------|
| 1 | ILA v0.2 — 40 sectores, confianza A en visitados | Datos, PI | Producto + campo | En curso (16 sectores live) |
| 2 | Observatorio 2026 PDF público + landing | Autoridad | Editorial | Piloto JSON live |
| 3 | Ingesta Censo 2024 → base estructurada | Datos | Técnico | Pendiente |
| 4 | Vectorizar PRC Puerto Varas (capa normativa) | Datos, herramientas | Técnico + RAG | Pendiente |
| 5 | Checklist pre-oferta interactivo (MVP) | Herramientas | Producto | Pendiente |
| 6 | Casos v2 — 100% con bloque ILA | Contenido, datos | Editorial | 3/3 migrados |
| 7 | Suscripción alertas normativas (waitlist) | Ingreso recurrente | Comercial | Pendiente |
| 8 | Atlas LA wireframe + 5 capas definidas | Herramientas | Producto | Pendiente |
| 9 | `KnowledgeItem` index en build-seo | Escalabilidad | Técnico | Schema listo |
| 10 | Puente RRSS → ILA / observatorio | Autoridad | RRSS | Parcial |

### Criterio de prioridad semanal

> ¿Esta semana aumentamos datapoints LAKG o solo publicamos contenido?

Si solo contenido → posponer frente a ingestión, herramienta o sector ILA nuevo.

---

## 10. Síntesis

Land Advisors no compite en **inventario**. Compite en **verdad territorial acumulada**.

El rediseño digital es:

1. Índices que el mercado cite  
2. Un grafo que crezca con cada cliente  
3. Herramientas que conviertan intuición en evidencia  
4. Observatorios que definan la agenda  
5. Comunidad y B2B que distribuyan la metodología  
6. Ingreso recurrente que financie datos, no solo consultas  

En 2046 el moat será la **historia territorial de Chile** que solo Land Advisors habrá indexado, verificado y actualizado sector a sector.

---

*Última actualización: julio 2026 · Mantener sincronizado con `estrategia-plataforma-2036.md` y `seo/estrategia-autoridad-2026.md`*
