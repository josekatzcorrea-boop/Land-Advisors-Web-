# Brochure Land Advisors Chile — versión definitiva

**Activo:** `corporativo/` · **Respaldo congelado:** `corporativo/official/`

Brochure vertical de 6 pantallas (móvil, WhatsApp, PDF móvil y PDF A4).

## Ver en navegador

```powershell
powershell -ExecutionPolicy Bypass -File landing\serve.ps1
```

http://127.0.0.1:8765/brochure/corporativo/index.html

## Compartir

| Formato | Comando / botón |
|---------|-----------------|
| **HTML** autocontenido | Botón «HTML» o `export-compartir.ps1` |
| **PDF móvil** (430px) | Botón «PDF móvil» o `export-pdf-movil.ps1` |
| **PDF A4** (imprimir) | Botón «PDF A4» o `export-pdf.ps1` |

```powershell
powershell -ExecutionPolicy Bypass -File brochure\corporativo\export-compartir.ps1
powershell -ExecutionPolicy Bypass -File brochure\corporativo\export-pdf-movil.ps1
powershell -ExecutionPolicy Bypass -File brochure\corporativo\export-pdf.ps1
```

## Estructura (6 páginas)

1. Portada  
2. Nuestra promesa  
3. Datos que respaldan nuestra expertise (1/2)  
4. Datos que respaldan nuestra expertise (2/2)  
5. Dónde trabajamos  
6. Por qué Land Advisors + contacto  

## Imágenes y marca

- Fotos: `brochure/images/`  
- Regenerar optimizadas: `optimize-brochure-images.ps1`  
- Paleta: `#052C4D`, `#031D33`, `#A7ADB3`  
- Descriptor: **Estrategia Inmobiliaria**

`brochure/index.html` redirige a `corporativo/`.
