# Análisis RAG — Cuenca Lago Llanquihue · 2026

**Fuente:** `RAG/Demografia/` (Censo CPV 2024), `RAG/Normativa/` (PRC, PLADECO, LGUC, OGUC).  
**Uso:** calibración del Índice Land Advisors (ILA) v0 y Observatorio 2026.

---

## Activos disponibles en RAG

| Carpeta | Contenido | Estado procesamiento |
|---------|-----------|---------------------|
| `Demografia/` | Censo 2024: zona/localidad, urbanos, manzana, aldeas, microdatos REDATAM, hogares, personas, viviendas | Crudo — script piloto en `RAG/_extract/analyze_censo.py` |
| `Demografia/` | Síntesis Censo 2017, manual microdatos 2024, presentación CASEN 2024 | PDF — pendiente ingestión LAKG |
| `Normativa/` | PRC Puerto Varas (memoria 2019), PRC Llanquihue, PLADECO PV 2022–2030, PLADECO Frutillar 2022–2028, LGUC, OGUC | PDF — pendiente vectorización + RAG |

---

## Demografía Censo 2024 (zona/localidad, CUT)

| Comuna | Población | Hogares | Inmigrantes | 25–44 años | 60+ años | Desocupación | Auto (vs. público) |
|--------|-----------|---------|-------------|------------|---------|--------------|------------------|
| **Puerto Varas** | 52.942 | 19.108 | **5,4%** | **31,8%** | 17,4% | **5,4%** | **68,9%** |
| **Frutillar** | 22.554 | 8.159 | 2,3% | 29,4% | 19,9% | 7,5% | 61,6% |
| **Llanquihue** | 18.088 | 6.206 | 2,4% | 28,2% | **21,1%** | 7,8% | **53,4%** |
| **Ensenada** | 12.320 | 4.853 | 1,3% | 24,7% | **25,3%** | 8,9% | 64,8% |

**Referencia 2017 (PLADECO PV):** Puerto Varas 44.578 hab.; ~72% urbano / ~28% rural.

### Lecturas para producto

1. **Puerto Varas** — Hub de atracción externa (inmigración, población activa, menor desocupación). ILA debe ponderar **conectividad y normativa** sobre precio de lista.
2. **Frutillar** — Mercado pausado, envejecido, casi sin inmigración; riesgo = **prima «Frutillar»** sin habilitación.
3. **Llanquihue** — Crecimiento y parcelaciones; variable crítica = **valor presente vs. costos de urbanización pendientes**.
4. **Ensenada** — Envejecimiento alto, Fresia concentra población; segmento **segunda vivienda / retiro**, liquidez distinta a PV.

---

## Normativa — vectores estructurales (extracción documental)

### Puerto Varas (PRC 2019 + PLADECO 2022–2030)

- Límite urbano en revisión; capítulo explícito de **conectividad**.
- **Zona de Interés Turístico Lago Llanquihue** y **zona saturada por calidad del aire** (macrozona centro-norte Los Lagos).
- **Plan Regulador Intercomunal Rivera Llanquihue** + plan comunal de movilidad.
- Crecimiento sostenido impulsado por **migración voluntaria** (PLADECO).

### Llanquihue (PRC + informe ambiental)

- Normas de **protección de aguas del Lago Llanquihue**.
- Humedales, patrimonio, basurales en cursos de agua — capas de riesgo para habilitación.

### Frutillar (PLADECO 2022–2028)

- Distinción población urbana/rural; zonas habitacionales y productivas.
- Vocación patrimonial y turística — reglamentos de copropiedad críticos para alojamiento.

---

## Implicancias para ILA v0

| Dimensión ILA | Variable RAG / campo |
|---------------|---------------------|
| Conectividad | Minutos verificados + Censo transporte (auto alto en PV) |
| Normativa | PRC zonas, ZIT, saturación aire, reglamento loteo |
| Demografía | Censo 2024 por zona; crecimiento 2017→2024 |
| Mercado | Casos LA + comparables (capa propietaria) |
| Habilitación | PRC ambiental LL + costos casos |

**Confianza del dato:** A = verificado en campo; B = cruce normativa + censo; C = estimación modelada.

---

*Generado para calibración interna. Actualizar al ingestar microdatos completos y vectorizar PRC.*
