"""Isotipo blanco: usa alpha del PNG transparente, elimina halo y sombra 3D."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / "assets" / "logo-isotipo-3d-transparente.png"
OUT = ROOT / "assets" / "logo-isotipo-blanco-transparente.png"


def _keep_top_components(mask: np.ndarray, top: int = 4) -> np.ndarray:
    from scipy import ndimage

    labeled, n = ndimage.label(mask)
    if n == 0:
        return mask
    sizes = sorted([((labeled == i).sum(), i) for i in range(1, n + 1)], reverse=True)
    keep = np.isin(labeled, [i for _, i in sizes[:top]])
    return ndimage.binary_closing(keep, iterations=1)


def main() -> None:
    arr = np.array(Image.open(SRC).convert("RGBA"), dtype=np.float32)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    chroma = np.maximum.reduce([r, g, b]) - np.minimum.reduce([r, g, b])

    # Halo blanco del recorte original
    fringe = (lum > 185) | ((r > 160) & (g > 160) & (b > 160))
    # Sombra gris 3D bajo el logo
    shadow = (chroma < 42) & (lum < 115) & (a > 10)
    # Píxeles semitransparentes muy débiles del canvas
    weak = a < 18

    mask = (a > 20) & ~fringe & ~shadow & ~weak
    mask = _keep_top_components(mask, top=4)

    alpha = np.zeros(mask.shape, dtype=np.uint8)
    alpha[mask] = 255
    alpha_im = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(radius=0.55))
    alpha_arr = np.array(alpha_im, dtype=np.uint8)

    out = np.zeros((*mask.shape, 4), dtype=np.uint8)
    out[:, :, :3] = 255
    out[:, :, 3] = alpha_arr

    im = Image.fromarray(out, mode="RGBA")
    bbox = im.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        pad = 10
        im = im.crop(
            (
                max(0, x0 - pad),
                max(0, y0 - pad),
                min(im.width, x1 + pad),
                min(im.height, y1 + pad),
            )
        )

    im = im.resize((im.width * 2, im.height * 2), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    im.save(OUT, optimize=True)
    print(f"OK {OUT} ({im.width}x{im.height}, {OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
