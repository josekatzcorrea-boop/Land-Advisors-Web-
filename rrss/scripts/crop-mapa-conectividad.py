"""Recorta espacio en blanco del mapa de conectividad y guarda en fotos-seleccion."""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    import subprocess
    import sys

    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
    from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "Selección de fotografías" / "mapa conectividad.jpg"
DST = ROOT / "rrss" / "assets" / "fotos-seleccion" / "mapa-conectividad.jpg"


def is_near_white(pixel, threshold=240):
    r, g, b = pixel[:3]
    return r >= threshold and g >= threshold and b >= threshold


def crop_white_margins(im: Image.Image) -> Image.Image:
    rgb = im.convert("RGB")
    w, h = rgb.size
    pixels = rgb.load()

    left = 0
    for x in range(w):
        white = sum(1 for y in range(0, h, 6) if is_near_white(pixels[x, y]))
        if white < (len(range(0, h, 6)) * 0.85):
            left = x
            break

    right = w - 1
    for x in range(w - 1, left, -1):
        white = sum(1 for y in range(0, h, 4) if is_near_white(pixels[x, y], 235))
        if white < (len(range(0, h, 4)) * 0.92):
            right = x
            break

    top = 0
    for y in range(h):
        white = sum(1 for x in range(left, right + 1, 6) if is_near_white(pixels[x, y]))
        if white < (len(range(left, right + 1, 6)) * 0.85):
            top = y
            break

    bottom = h - 1
    for y in range(h - 1, top, -1):
        white = sum(1 for x in range(left, right + 1, 6) if is_near_white(pixels[x, y]))
        if white < (len(range(left, right + 1, 6)) * 0.85):
            bottom = y
            break

    pad = 4
    box = (
        max(0, left - pad),
        max(0, top - pad),
        min(w, right + pad + 1),
        min(h, bottom + pad + 1),
    )
    return rgb.crop(box)


def main():
    im = Image.open(SRC)
    print(f"Original: {im.size}")
    cropped = crop_white_margins(im)
    print(f"Cropped: {cropped.size}")
    DST.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(DST, quality=92, optimize=True)
    print(f"Saved: {DST}")


if __name__ == "__main__":
    main()
