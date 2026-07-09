# Plan B — Chip nuevo para el bot (recomendado si coexistencia falla)

Meta **no permite** registrar el +56974533265 por API en cuentas SMB (`Register endpoint is not available for SMB businesses`).  
Coexistencia en el mismo número depende de un flujo de Meta que se cierra sin completar.

## Solución práctica (1 día)

| Línea | Uso |
|-------|-----|
| **+56974533265** | WhatsApp Business en tu celular — contactos manuales |
| **Chip nuevo +56 9…** | Solo bot / campañas / landing |

### Pasos

1. Compra chip prepago (Entel, Movistar, WOM, etc.)
2. En Meta Developers → W API → Paso 2 → **Agregar número** (el nuevo, sin error #2655122)
3. Verificación SMS → anota **Phone Number ID** y **WABA ID**
4. Actualiza Render Environment con los IDs nuevos
5. En el repo, ejecuta (reemplaza número):

```powershell
cd rrss/whatsapp-agent
node scripts/switch-campaign-phone.mjs --phone 569XXXXXXXX
```

6. Despliega landing (`npm run build` o workflow GitHub Pages)
7. Prueba desde otro celular con `[Ref: LA-BUSQ30]`

### En la web / ads

- Botón WhatsApp verde → número **nuevo**
- Texto visible puede decir: *“También nos escribes al +56974533265”* si quieres mantener la marca personal

El agente sigue ignorando contactos directos sin `[Ref: LA-BUSQ30]` — solo responde leads de campaña.
