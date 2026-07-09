"""Reorder home sections for conversion funnel."""
import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "index.html"
html = path.read_text(encoding="utf-8")

main_match = re.search(r"(<main>)(.*?)(</main>)", html, re.DOTALL)
if not main_match:
    raise SystemExit("no main")

main_open, main_body, main_close = main_match.group(1), main_match.group(2), main_match.group(3)

pattern = re.compile(r"(?=\n    (?:<section|<div class=\"tech-marquee))")
parts = [p for p in pattern.split(main_body) if p.strip()]

def get_key(chunk: str) -> str:
    m = re.search(r'\bid="([^"]+)"', chunk)
    if m:
        return m.group(1)
    if "tech-marquee" in chunk:
        return "tech-marquee"
    if "hero-cinematic" in chunk:
        return "inicio"
    if "cta-band" in chunk:
        return "cta"
    return f"unknown-{hash(chunk) & 0xFFFF}"

by_id = {get_key(p): p for p in parts}

primary = [
    "inicio",
    "problema",
    "consecuencias",
    "solucion",
    "casos",
    "servicios",
    "oportunidades",
    "faq",
    "contacto",
    "cta",
]
secondary = [
    "tech-marquee",
    "innovacion",
    "territorios",
    "blog",
    "nosotros",
    "partners",
]

order = primary + secondary
missing = [k for k in order if k not in by_id]
extra = [k for k in by_id if k not in order]
if missing:
    print("Missing:", missing)
if extra:
    print("Extra:", extra)

new_body = "".join(by_id[k] for k in order if k in by_id)
new_html = html[: main_match.start()] + main_open + new_body + main_close + html[main_match.end() :]
path.write_text(new_html, encoding="utf-8")
print("Reordered", len(order), "blocks")
