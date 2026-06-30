# Publicar E2 + P2 — Semana 1 LinkedIn

Orden recomendado: **E2 empresa (mié)** → **P2 personal (jue)**

---

## E2 — Land Advisors (empresa)

| | |
|---|---|
| **ID** | `LI-2026-06-18-E2` |
| **Cuándo** | Miércoles 11:00 |
| **Canal** | Página **Land Advisors Chile** |
| **Tema** | Metodología — territorio primero, activo después |

**PNGs:** `rrss/linkedin/output/LI-2026-06-18-E2/instagram/`  
`land-advisors-li-metodologia-01.png` … `06.png`

**Guía detallada:** `guia-publicacion-E2-empresa.md`

**Exportar de nuevo (si hace falta):**
```powershell
powershell -ExecutionPolicy Bypass -File rrss\scripts\export-carousel.ps1 -PostId LI-2026-06-18-E2 -LinkedIn
```

---

## P2 — José Katz (personal)

| | |
|---|---|
| **ID** | `LI-2026-06-19-P2` |
| **Cuándo** | Jueves 08:30 |
| **Canal** | Perfil **personal** |
| **Tema** | No soy corredor — 5 diferencias |

**PNGs:** `rrss/linkedin/output/LI-2026-06-19-P2/instagram/`  
`land-advisors-li-no-corredora-01.png` … `06.png`

**Guía detallada:** `guia-publicacion-P2-personal.md`

**Exportar:**
```powershell
powershell -ExecutionPolicy Bypass -File rrss\scripts\export-carousel.ps1 -PostId LI-2026-06-19-P2 -LinkedIn
```

---

## Cross-promotion

| Día | Quién publica | Quién comenta |
|-----|---------------|---------------|
| Mié E2 | Empresa | José desde personal |
| Jue P2 | José personal | Land Advisors desde página |

---

## Archivos fuente

| Post | JSON | HTML |
|------|------|------|
| E2 | `posts/LI-2026-06-18-E2.json` | `posts/LI-2026-06-18-E2/index.html` |
| P2 | `posts/LI-2026-06-19-P2.json` | `posts/LI-2026-06-19-P2/index.html` |
