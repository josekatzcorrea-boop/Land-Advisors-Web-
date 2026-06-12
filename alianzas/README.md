# Alianzas comerciales — Land Advisors

Presentaciones verticales para reuniones o envío por WhatsApp/correo.

## Versiones

| Archivo | Audiencia | Modelo |
|---------|-----------|--------|
| `index.html` | Corredoras de propiedades | Canje: LA cobra al comprador, corredora al propietario |
| `desarrolladores.html` | Desarrolladores / loteos | Comisión por venta concretada |

## Ver en navegador

Con `landing/serve.ps1` activo:

- http://127.0.0.1:8765/alianzas/index.html
- http://127.0.0.1:8765/alianzas/desarrolladores.html

## Exportar PDF

```powershell
# Corredoras
powershell -ExecutionPolicy Bypass -File alianzas\export-pdf.ps1 -Tipo corredoras

# Desarrolladores
powershell -ExecutionPolicy Bypass -File alianzas\export-pdf.ps1 -Tipo desarrolladores
```

O botón **Guardar PDF** en la barra superior (impresión del navegador).
