# Brochures Land Advisors Chile

Dos formatos complementarios:

| Versión | Ruta | Uso |
|---------|------|-----|
| **Corporativo premium** | `corporativo/` | PDF A4 apaisado, consultora boutique, servicios completos |
| **Digital vertical** | `index.html` | WhatsApp / móvil, narrativa emocional comprador |

---

## Brochure corporativo premium (`corporativo/`)

Referencia editorial: catálogo Terrasur 2026 (calidad, no copia literal).

**10 páginas A4 apaisado:**

1. Portada — Territorio + Tecnología + Inversión  
2. Quiénes somos  
3. Público objetivo (4 perfiles)  
4. Cómo trabajamos (metodología + herramientas)  
5. Diagnóstico Estratégico Inmobiliario  
6. Búsqueda Estratégica de Terrenos  
7. Asesoría de Compra y Adquisición  
8. Estudio de Potencial Inmobiliario  
9. Estructuración y Desarrollo de Proyectos  
10. Cierre y contacto  

### Ver y exportar

```powershell
powershell -ExecutionPolicy Bypass -File landing\serve.ps1
```

http://127.0.0.1:8765/brochure/corporativo/index.html

```powershell
powershell -ExecutionPolicy Bypass -File brochure\corporativo\export-pdf.ps1
```

→ `Land-Advisors-Corporativo.pdf`

### Imágenes

- `brochure/images/` — optimizadas desde **Selección de fotografías** (Escritorio)  
- `landing/images/` — hero, prc y fotos de casos  
- Regenerar: `optimize-brochure-images.ps1`

### Identidad

- Paleta v2: `#052C4D`, `#031D33`, `#A7ADB3`  
- Descriptor: **Estrategia Inmobiliaria**  
- Logo: `assets/logo-horizontal.png` / `logo-horizontal-light.png`  
- Sin rotar, deformar ni recortar elementos territoriales críticos  

---

## Brochure digital vertical (`index.html`)

10 pantallas móviles, tono emocional orientado al comprador de terreno.

http://127.0.0.1:8765/brochure/index.html

```powershell
powershell -ExecutionPolicy Bypass -File brochure\export-pdf.ps1
```

→ `Land-Advisors-Digital.pdf`

---

## Histórico

`triptico/` — versión tríptico impreso anterior.
