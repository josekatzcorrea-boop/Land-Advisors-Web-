"""Apply US RE (voice A) glossary replacements across EN JSON sources."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "i18n" / "en" / "plh.json",
    ROOT / "i18n" / "en" / "seo-pages.json",
    ROOT / "i18n" / "en" / "home.json",
    ROOT / "i18n" / "en" / "common.json",
    ROOT / "seo" / "en" / "services-catalog.json",
    ROOT / "seo" / "en" / "campaigns.json",
    ROOT / "seo" / "en" / "cases.json",
    ROOT / "seo" / "en" / "guides.json",
    ROOT / "seo" / "en" / "posts.json",
    ROOT / "seo" / "en" / "territories-content.json",
    ROOT / "seo" / "en" / "pages-hubs.json",
    ROOT / "seo" / "en" / "inteligencia-territorial.json",
    ROOT / "seo" / "en" / "ila-index.json",
]

# Longer / more specific first
REPLACEMENTS = [
    ("Transferable learning", "What this means for you"),
    ("transferable learning", "what this means for you"),
    ("Territorial intelligence consultancy", "Independent land advisory"),
    ("territorial intelligence consultancy", "independent land advisory"),
    ("Territorial intelligence", "Local market insight"),
    ("territorial intelligence", "local market insight"),
    ("Territorial property investment", "Land investment in the area"),
    ("territorial consultancy", "land advisory"),
    ("Territorial consultancy", "Land advisory"),
    ("territorial shortlisting", "shortlisting with local criteria"),
    ("territorial criteria", "local criteria"),
    ("territorial context", "local context"),
    ("territorial knowledge", "local market knowledge"),
    ("Territorial knowledge", "Local market knowledge"),
    ("territorial reading", "local market read"),
    ("Territorial reading", "Local market read"),
    ("territorial review", "on-the-ground review"),
    ("Territorial review", "On-the-ground review"),
    ("territorial score", "sector score"),
    ("Territorial score", "Sector score"),
    ("territorial index", "sector index"),
    ("Territorial index", "Sector index"),
    ("territorial appreciation", "appreciation in the area"),
    ("Preliminary territorial", "Preliminary on-the-ground"),
    ("rural contour", "rural fringe"),
    ("Rural contour", "Rural fringe"),
    ("Rural Contour", "Rural fringe"),
    ("contorno rural", "rural fringe"),
    ("patrimonial investors", "long-term investors"),
    ("Patrimonial investors", "Long-term investors"),
    ("patrimonial investor", "long-term investor"),
    ("Patrimonial investor", "Long-term investor"),
    ("Patrimonial investment", "Long-term investment"),
    ("patrimonial investment", "long-term investment"),
    ("Heritage investment", "Long-term investment"),
    ("heritage investment", "long-term investment"),
    ("Heritage consultancy", "Land investment advisory"),
    ("personalised", "personalized"),
    ("Personalised", "Personalized"),
    ("specialised", "specialized"),
    ("Specialised", "Specialized"),
    ("neighbourhood", "neighborhood"),
    ("Neighbourhood", "Neighborhood"),
    ("neighbouring", "neighboring"),
    ("Neighbouring", "Neighboring"),
    ("neighbour", "neighbor"),
    ("Neighbour", "Neighbor"),
    ("favourite", "favorite"),
    ("Favourite", "Favorite"),
    ("favour", "favor"),
    ("Favour", "Favor"),
    ("catalogue", "catalog"),
    ("Catalogue", "Catalog"),
    ("Prioritise", "Prioritize"),
    ("prioritise", "prioritize"),
    ("materialise", "materialize"),
    ("Materialise", "Materialize"),
    ("optimisation", "optimization"),
    ("Optimisation", "Optimization"),
    ("organisation", "organization"),
    ("Organisation", "Organization"),
    ("favourable", "favorable"),
    ("Favourable", "Favorable"),
    ("square metre", "square meter"),
    ("Square metre", "Square meter"),
    ("per square metre", "per square meter"),
    ("estate agencies", "brokerages"),
    ("estate agency", "brokerage"),
    ("Estate agency", "Brokerage"),
    ("an brokerage", "a brokerage"),
    ("an brokerage's", "a brokerage's"),
    ("from an brokerage", "from a brokerage"),
    ("capital growth", "appreciation"),
    ("Capital growth", "Appreciation"),
    ("urbanisation", "urbanization"),
    ("Urbanisation", "Urbanization"),
    ("urbanised", "urbanized"),
    ("Urbanised", "Urbanized"),
    ("enabling costs", "site-prep costs"),
    ("Enabling costs", "Site-prep costs"),
    ("enabling budget", "site-prep budget"),
    ("enabling risk", "site-prep risk"),
    ("enabling status", "site-prep status"),
    ("enabling timelines", "site-prep timelines"),
    ("enabling work", "site-prep work"),
    ("enabling flow", "site-prep cost flow"),
    ("post-enabling", "after site prep"),
    ("Post-enabling", "After site prep"),
    ("without enabling", "without site prep"),
    ("plus enabling", "plus site prep"),
    ("+ enabling", "+ site prep"),
    ("and enabling", "and site prep"),
    ("or enabling", "or site prep"),
    (", enabling,", ", site prep,"),
    ("when enabling", "when prepping"),
    ("When enabling", "When prepping"),
    ("site enabling", "site prep"),
    ("Site enabling", "Site prep"),
    ("more enabling", "more site prep"),
    ("define enabling", "define site prep"),
    ("matched by enabling", "matched by site prep"),
    ("Enabling", "Site prep"),
    ("value captured", "vs. purchase price"),
    ("Value captured", "Vs. purchase price"),
    ("strategy session", "strategy call"),
    ("Strategy session", "Strategy call"),
    ("strategic session", "strategy call"),
    ("Strategic Diagnostic", "Diagnostic"),
    ("Strategic diagnostic", "Diagnostic"),
    ("strategic diagnostic", "Diagnostic"),
    ("Strategic property diagnostic", "Property Diagnostic"),
    ("strategic property diagnostic", "property Diagnostic"),
    ("Book diagnostic", "Book a Diagnostic"),
    ("book diagnostic", "book a Diagnostic"),
    ("Book a a Diagnostic", "Book a Diagnostic"),
    ("peri-urban fringe", "rural fringe"),
    ("peri-urban rural fringe", "rural fringe"),
    ("planning instruments", "zoning and planning rules"),
    ("Planning instruments", "Zoning and planning rules"),
    ("verifiable support", "checkable backing"),
    ("verifiable sources", "sources you can check"),
    ("verifiable information", "checkable information"),
    ("verifiable data", "checkable data"),
    ("commercial vocation", "commercial potential"),
    ("Commercial vocation", "Commercial potential"),
    ("land portfolio of our own", "inventory of our own"),
    ("no land portfolio", "no inventory"),
    ("mass catalogue", "mass catalog"),
    ("Retrieval Augmented Generation (RAG)", "grounded AI on our local files"),
    ("Retrieval Augmented Generation", "grounded AI"),
    ("Present value vs. future value", "What it costs now vs. what it can be worth later"),
    ("present value vs. future value", "what it costs now vs. what it can be worth later"),
]


def walk(obj):
    if isinstance(obj, str):
        s = obj
        for a, b in REPLACEMENTS:
            s = s.replace(a, b)
        return s
    if isinstance(obj, list):
        return [walk(x) for x in obj]
    if isinstance(obj, dict):
        return {k: walk(v) for k, v in obj.items()}
    return obj


def main():
    for path in TARGETS:
        if not path.exists():
            print("skip missing", path)
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        new = walk(data)
        path.write_text(json.dumps(new, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("updated", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
