"""One-off fix for leftover A-voice glossary glitches."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXES = [
    ("Site prep land on the rural fringe", "Preparing land on the rural fringe"),
    ("Site prep land", "Preparing land"),
    ("sectors, enabling and infrastructure", "sectors, site prep and infrastructure"),
    ("but enabling or connectivity", "but site prep or connectivity"),
    ("Costly enabling", "Costly site prep"),
    ("without enabling to match", "without site prep to match"),
    ("Purchase + enabling", "Purchase + site prep"),
    ("purchase + enabling", "purchase + site prep"),
    ("more enabling if", "more site prep if"),
    ("define enabling and", "define site prep and"),
    ("matched by enabling", "matched by site prep"),
    ("compensate for enabling risk", "compensate for site-prep risk"),
    ("an brokerage", "a brokerage"),
    ("Book a a Diagnostic", "Book a Diagnostic"),
    ("Book a diagnostic call", "Book a Diagnostic call"),
]


def walk(obj):
    if isinstance(obj, str):
        s = obj
        for a, b in FIXES:
            s = s.replace(a, b)
        return s
    if isinstance(obj, list):
        return [walk(x) for x in obj]
    if isinstance(obj, dict):
        return {k: walk(v) for k, v in obj.items()}
    return obj


def main():
    paths = list((ROOT / "i18n" / "en").glob("*.json")) + list(
        (ROOT / "seo" / "en").glob("*.json")
    )
    for p in paths:
        data = json.loads(p.read_text(encoding="utf-8"))
        new = walk(data)
        if new != data:
            p.write_text(
                json.dumps(new, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
            print("fixed", p.relative_to(ROOT))
    print("done")


if __name__ == "__main__":
    main()
