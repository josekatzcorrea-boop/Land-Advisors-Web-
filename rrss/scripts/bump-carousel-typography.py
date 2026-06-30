#!/usr/bin/env python3
"""Aplica escala tipográfica mobile-first a carousel.css (feed + story repost)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Orden: mayor → menor (evita reemplazos encadenados incorrectos)
FONT_SIZE_MAP: list[tuple[str, str]] = [
    ("120px", "140px"),
    ("88px", "100px"),
    ("64px", "76px"),
    ("60px", "72px"),
    ("58px", "70px"),
    ("56px", "66px"),
    ("54px", "64px"),
    ("50px", "60px"),
    ("48px", "58px"),
    ("44px", "52px"),
    ("40px", "48px"),
    ("32px", "40px"),
    ("30px", "38px"),
    ("28px", "34px"),
    ("26px", "32px"),
    ("24px", "30px"),
    ("22px", "28px"),
    ("21px", "26px"),
    ("20px", "26px"),
    ("18px", "24px"),
    ("17px", "22px"),
    ("16px", "20px"),
    ("13px", "18px"),
]

TYPOGRAPHY_VARS = """
  /* Tipografía carrusel — legible en feed y al repostear como story (móvil) */
  --fs-badge: 28px;
  --fs-eyebrow: 30px;
  --fs-title: 70px;
  --fs-title-sm: 58px;
  --fs-body: 38px;
  --fs-num: 28px;
  --fs-split-title: 52px;
  --fs-split-body: 32px;
  --fs-chip: 26px;
  --fs-min: 24px;
"""


def bump_css(content: str) -> str:
    if "--fs-body:" not in content:
        content = content.replace(
            "  --pad: 72px;\n}",
            f"  --pad: 72px;{TYPOGRAPHY_VARS}}}",
            1,
        )
        # S1 usa --pad: 64px
        if "--fs-body:" not in content:
            content = content.replace(
                "  --pad: 64px;\n}",
                f"  --pad: 64px;{TYPOGRAPHY_VARS}}}",
                1,
            )

    for old, new in FONT_SIZE_MAP:
        content = content.replace(f"font-size: {old}", f"font-size: {new}")
    return content


def bump_html(content: str) -> str:
    for old, new in FONT_SIZE_MAP:
        content = content.replace(f"font-size:{old}", f"font-size:{new}")
        content = content.replace(f"font-size: {old}", f"font-size: {new}")
    return content


def process_post(post_dir: Path) -> None:
    css = post_dir / "carousel.css"
    html = post_dir / "index.html"
    if css.exists():
        css.write_text(bump_css(css.read_text(encoding="utf-8")), encoding="utf-8")
        print(f"  CSS  {css.relative_to(post_dir.parent.parent)}")
    if html.exists():
        html.write_text(bump_html(html.read_text(encoding="utf-8")), encoding="utf-8")
        print(f"  HTML {html.relative_to(post_dir.parent.parent)}")


def main() -> None:
    rrss = Path(__file__).resolve().parent.parent
    posts = rrss / "posts"
    targets = sys.argv[1:] or [
        "2026-07-01-M1",
        "2026-07-02-E1",
        "2026-07-03-S1",
        "2026-07-04-A1",
        "2026-07-07-T1",
    ]
    print("Bump tipografía carrusel:")
    for post_id in targets:
        post_dir = posts / post_id
        if not post_dir.is_dir():
            print(f"  SKIP {post_id} (no existe)")
            continue
        process_post(post_dir)

    templates = rrss / "templates"
    templates.mkdir(exist_ok=True)
    src = posts / "2026-07-01-M1" / "carousel.css"
    if src.exists():
        (templates / "carousel.css").write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"  TEMPLATE {templates / 'carousel.css'}")


if __name__ == "__main__":
    main()
