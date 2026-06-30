# Tipografía carruseles Instagram — Land Advisors

**Objetivo:** que el texto se lea bien en el feed **y** al repostear un slide como **Historia** en celular (la imagen se ve más chica; el copy debe compensar con tamaño y contraste).

Canvas: **1080 × 1350 px** (4:5). Fuente: **Montserrat**.

## Escala mínima (v2 — legibilidad móvil)

| Elemento | Tamaño | Uso |
|----------|--------|-----|
| Título principal (`.slide__title`) | **70 px** | Slide 1, titulares |
| Título secundario (`.slide__title--sm`) | **58 px** | Subtítulos en slides claros |
| Cuerpo (`.slide__body`) | **38 px** | Párrafos — nunca bajar de 32 px |
| Badge / pilar (`.slide__badge`) | **28 px** | Etiqueta superior |
| Eyebrow (`.slide__eyebrow`) | **30 px** | Línea contextual |
| Split título (`.slide--split .slide__title`) | **52 px** | Foto + texto |
| Split cuerpo | **32 px** | Panel inferior split |
| Chips / listas cortas | **26 px** | `.trait-chip`, bullets |
| Disclaimer / nota legal | **24 px** | Mínimo absoluto en canvas |
| Numeración slide | **28 px** | `.slide__num` |

## Reglas de diseño

1. **Slide 1 siempre con fotografía** + texto (hero, split o photo-card).
2. **No usar `slide--intro-white` solo texto** en posts nuevos.
3. **Evitar inline `font-size` &lt; 24 px** en `index.html`; preferir clases CSS.
4. **Probar legibilidad:** exportar slide 1 → abrir PNG en celular → simular story (zoom ~70 %).
5. Al crear un post nuevo, copiar `rrss/templates/carousel.css` (incluye esta escala).

## Plantilla

- CSS base: `rrss/templates/carousel.css`
- Script de actualización masiva: `rrss/scripts/bump-carousel-typography.py`
