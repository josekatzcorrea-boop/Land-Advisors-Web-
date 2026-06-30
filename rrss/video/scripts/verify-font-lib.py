"""Verifica Montserrat-Regular.ttf para libass (requiere fonttools)."""
import sys
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
except ImportError:
    print("fonttools no instalado")
    sys.exit(1)

path = Path(sys.argv[1])
f = TTFont(path)
family = f["name"].getDebugName(1)
sub = f["name"].getDebugName(2)
print(f"Archivo: {path.name} ({path.stat().st_size // 1024} KB)")
print(f"Familia: {family} | Peso: {sub}")
if family == "Montserrat" and sub in ("Regular", "Normal", "400"):
    print("OK — subtítulos usan Montserrat Regular (brand book: captions)")
elif family == "Montserrat SemiBold":
    print("OK — énfasis usa Montserrat SemiBold")
elif family == "Montserrat" and sub in ("SemiBold", "Semi Bold", "600"):
    print("OK — énfasis usa Montserrat SemiBold")
else:
    print(f"WARN — revisar Fontname en ASS (familia detectada: {family} {sub})")
    sys.exit(1)
