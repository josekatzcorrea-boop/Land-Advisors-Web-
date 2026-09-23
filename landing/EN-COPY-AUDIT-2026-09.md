# English copy audit — Land Advisors web

**Scope:** `landing/i18n/en/*` + `landing/seo/en/*` (home, nav/forms, PLH, campaigns, cases, guides, services, territories, hubs).  
**Date:** 2026-09-23  
**Lens:** US English buyer / real-estate professional (not UK agency English).

### Labels

| Code | Meaning |
|------|---------|
| **A** | Sounds like a native American real-estate professional |
| **B** | Correct English, but sounds translated |
| **C** | Sounds like AI / corporate marketing |
| **D** | Too sophisticated / abstract |
| **E** | Strong Land Advisors voice (buyer ally, territory-first, clear CTA) |

*Note:* A line can be **E** without being fully **A** (brand-true but slightly foreign). Prefer **A+E** as the target for hero, CTAs and buyer-facing pages.

---

## 1. Overall verdict

| Grade | Share (approx.) | Where it shows up most |
|-------|-----------------|------------------------|
| **A** | ~15% | Short CTAs, some FAQ answers, PLH “we don’t sell land” beats |
| **B** | ~40% | Most home body, campaigns, cases, guides — literal ES→EN |
| **C** | ~20% | Innovation/RAG section, meta descriptions, some CTAs |
| **D** | ~15% | “Territorial intelligence”, “patrimonial”, “rural contour”, RAG copy |
| **E** | ~25% | Positioning lines that survive translation (“We don’t sell land…”) — often mixed with B/D |

**Bottom line:** English is **competent and on-message**, but it mostly reads as **translated Chilean consultancy English with British spellings**, not as a US advisor talking to a buyer. ChatGPT / native readers will feel “correct but not local.”

---

## 2. Cross-cutting patterns (not native US)

| Pattern | Example | Better US RE instinct |
|---------|---------|------------------------|
| British spelling | personalised, specialised, neighbourhood, urbanised, catalogue | personalized, specialized, neighborhood, urbanized, catalog |
| Calque from Spanish | “patrimonial investor”, “rural contour”, “strategy session”, “enabling costs” | wealth / long-term investor; rural fringe / outskirts; strategy call; site-prep / infrastructure costs |
| Abstract brand nouns | “Territorial intelligence”, “verifiable context”, “capital growth” | local market insight; facts on the ground; appreciation / upside |
| Formal register | “We respond to patrimonial investors…” | “We work with investors, families…” |
| Soft AI cadence | “amplify it”, “aligned with your goals”, “innovation is not using AI for its own sake” | shorter, concrete, less essay-like |
| Metric jargon | “value captured”, “UF invested through our advisory” | “about 50% above purchase price”; keep UF but explain once |

---

## 3. By surface

### 3.1 Home (`i18n/en/home.json`) — highest visibility

| Text (abbrev.) | Grade | Why |
|-----------------|-------|-----|
| “We help you buy the right land.” | **A / E** | Clear, human, on-brand |
| “We don’t sell land. We are independent consultants…” | **E** (+ light **B**) | Strong LA positioning; “Lago Llanquihue … basin” is fine; slightly formal |
| “There’s always supply. Local criteria and knowledge aren’t.” | **E** / **B** | Good idea; “criteria” stacks oddly in US speech (“judgment / know-how”) |
| “how to read the rural contour” | **D** / **B** | Insider calque; US buyer won’t parse “contour” |
| Situation quotes (Santiago, fair price, etc.) | **A** / **E** | Natural buyer voice |
| “Paying for the photo without comparing…” | **A** / **E** | Excellent |
| “Your land acquisition partner” | **C** | Corporate title-case feel |
| “Less noise. Better decisions. An ally who already knows the basin.” | **E** | Strong LA |
| “We filter before you visit” / “what the listing doesn’t say” | **A** / **E** | Native and on-brand |
| Case frames “What the market saw / What we identified” | **E** / **A** | Clear storytelling |
| “Present value vs. future value” | **D** | Finance textbook, not buyer talk |
| “Personalised search” | **B** | UK spelling + calque of *Búsqueda personalizada* → US: “Custom land search” / “Guided search” |
| “Patrimonial investor” | **B** / **D** | Not US RE vocabulary → “Long-term / equity investor” |
| “Ready to decide with criteria?” | **B** | Literal; US: “Ready to decide with a clear plan?” |
| Full **Innovation / RAG** block | **C** + **D** | Reads like tech brochure, not advisor |
| “Retrieve → contextualize → recommend with backing.” | **C** | Process jargon |
| Meta: “Territorial intelligence and rural real estate investment consulting…” | **C** / **D** | SEO soup |
| José bio “closer to an explorer than a seller” | **E** | Distinctive LA |

**Home summary:** Hero + pain cards = best English on the site. Mid/lower home drifts to **B/C/D**. Innovation section is the weakest native fit.

---

### 3.2 Common UI (`i18n/en/common.json`)

| Text | Grade | Note |
|------|-------|------|
| Nav: Services, Guides, Blog, About us | **A** | Fine (Case studies OK; site hides Cases in EN nav) |
| “Diagnostic” as product name | **B** | US RE more often “consult” / “strategy call”; keep as product if defined once |
| “Book a diagnostic session” | **B** / **A** | Understandable; slightly clinical |
| “Strategic advisory · Southern Chile” | **C** | Tagline-y |
| “Territorial intelligence before you invest” (CTA band) | **D** / **C** | Abstract |
| Form / lead microcopy | Mostly **A** / **B** | Clear enough |
| “structure your search” | **B** | Calque of *ordenar la búsqueda* → “get your search organized” |

---

### 3.3 Patagonia Land Hunter (`i18n/en/plh.json`)

Strongest **international-buyer** page overall.

| Text | Grade |
|------|-------|
| “Find your place in Patagonia.” | **A** / **E** |
| “We don’t sell land. We find it for you.” | **A** / **E** |
| “no own inventory to sell” / “no own plots to push” | **E** / **A** |
| “Curated shortlist: few compatible alternatives, not mass listings” | **A** / **E** |
| “Six things you should not handle alone from abroad” | **A** / **E** |
| “Your local partner in Patagonia” / “eyes on the ground” | **A** / **E** |
| “Patrimonial investors” / “Patrimonial investment” | **B** / **D** |
| “Local Land Acquisition Partner” | **C** (title) / useful as B2B label |
| “Apparent risks” | **B** | Slightly translated |
| Meta description | **A** / **B** | Clearer than home meta |

**PLH summary:** Closest to **A+E**. Fix “patrimonial” and a few formal nouns and it becomes the EN voice model for the rest of the site.

---

### 3.4 Campaigns (`seo/en/campaigns.json`)

| Pattern | Grade | Examples |
|---------|-------|----------|
| Problem/gain headlines | **E** mixed with **B** | “Buy land in the south without losing months on listings that do not fit” |
| “estate agency” | **B** | UK; US: “brokerage” / “real estate agency” |
| “heritage investment / Heritage consultancy” | **B** / **D** | Calque of *patrimonial* |
| “tourism narrative” / “optimistic slide deck” | **E** / **A** | Sharp |
| “Photos open the visit. Territory, regulation and numbers close the decision…” | **E** | Strong LA (ally tone) |
| “capital growth” repeated | **D** / **B** | Prefer “appreciation” / “upside” |
| “rural fringe” | **A** / **E** | Better than “rural contour” |
| FAQ “We have no portfolio and no seller commission.” | **A** / **E** | Excellent |

**Campaigns summary:** Intent is right; vocabulary still half-translated. Replace heritage/capital-growth/estate-agency cluster.

---

### 3.5 Cases (`seo/en/cases.json`)

| Pattern | Grade |
|---------|-------|
| Narrative structure (Problem → Analysis → Decision → Outcome) | **E** / **A** |
| “peri-urban fringe”, “planning instruments”, “enabling costs” | **B** / **D** |
| “value capture” | **D** (finance) |
| “Transferable learning” | **C** / **B** | Report heading, not web |
| Disclaimer language | **A** (appropriate) |

Cases **teach well** but sound like **translated professional reports**, not US case-study marketing.

---

### 3.6 Guides (`seo/en/guides.json`)

| Pattern | Grade |
|---------|-------|
| Step titles (Intended use, Budget, Sectors…) | **A** / **B** |
| “Enabling” as step name | **B** | Opaque; “Site prep / utilities” |
| Body paragraphs | Mostly **B** with **E** intent |
| “without hype” | **A** / **E** |
| Long multi-clause sentences | **B** | Spanish rhythm |

Guides are **useful B**: correct, thorough, not yet spoken American English.

---

### 3.7 Services catalog (`seo/en/services-catalog.json`)

| Text | Grade |
|------|-------|
| “Territory first, asset second” | **E** |
| “We are not an estate agency or property portal.” | **E** / **B** (estate) |
| “More than a piece of land” + lifestyle gallery | **C** / **E** | Slightly brochure |
| “Personalised land search” | **B** |
| “For buyers who want curated options, not a mass catalogue.” | **E** / **B** (catalogue) |
| “commercial vocation of a piece of land” | **D** / **B** |
| Deliverable lists | **A** / **B** | Fine as specs |

---

## 4. Strong Land Advisors voice (**E**) — keep / amplify

These already sound like the brand (even if polish spelling later):

1. “We don’t sell land…” / “We find it for you.”
2. “Paying for the photo without comparing real alternatives…”
3. “We filter before you visit” / “We read what the listing doesn’t say”
4. “If it’s not the right alternative, we say so and keep searching with you.”
5. “Our job is a good purchase, not a fast one.”
6. “Photos open the visit. Territory, regulation and numbers close the decision…”
7. “An ally who already knows the basin.”
8. PLH: “not a mass listing dump” / “eyes on the ground”

---

## 5. Priority rewrite list (impact × nativeness)

| Priority | Item | From → Toward |
|----------|------|----------------|
| P0 | “rural contour” (sitewide) | rural fringe / outskirts of town |
| P0 | “patrimonial / heritage investment” | long-term / wealth / equity investor |
| P0 | UK spellings (ise/our) | US: personalized, neighborhood, catalog… |
| P0 | Home Innovation / RAG block | Cut jargon; 3 concrete sentences or move to appendix page |
| P1 | “Territorial intelligence” in metas/CTAs | Local market + land insight / “know the area before you buy” |
| P1 | “Diagnostic” product label | Keep brand term + plain gloss: “strategy call (Diagnostic)” |
| P1 | “Personalised search” | Custom / guided land search |
| P1 | “estate agency” | brokerage |
| P2 | Case headings “Transferable learning” | “What this means for you” |
| P2 | “capital growth / value captured” | appreciation / upside vs. purchase price |
| P2 | “enabling costs” | site-prep / infrastructure costs |

---

## 6. Suggested grade target by page type

| Page type | Target mix |
|-----------|------------|
| Home hero + FAQ + CTAs | **A + E** |
| PLH (intl) | **A + E** (already closest) |
| Services / forms | **A** with light **E** |
| Cases / guides | **A** clarity, keep **E** thesis; less **D** nouns |
| Innovation | Either rewrite hard to **A**, or demote in EN IA |

---

## 7. One-sentence diagnosis

English EN is **strategically aligned with Land Advisors**, but **linguistically still translated consultancy English (often British)** — so natives hear **B/C/D** more than **A**, except on a few excellent lines that already carry the **E** voice.

---

## 8. Status — voice A applied (2026-09-23)

**Done in practice:** EN sources now prioritize US real-estate voice (**A**):

- `i18n/en/home.json` + `common.json` — rewritten to A+E
- `i18n/en/plh.json` — full A polish (intl buyer page)
- Glossary pass via `landing/scripts/apply-en-voice-a.py` on `seo/en/*` + `seo-pages.json` (US spelling, rural fringe, long-term investor, site prep, Diagnostic, Personalized, brokerage, local market insight, etc.)
- Residual glitches cleaned (Site prep land → Preparing land; enabling remnants; Area map; long-term hold)

**Still intentional:** product names Diagnostic / Personalized Search; “heritage” where it means Frutillar cultural brand; verb “enabling development” (allows).

**Deploy note:** EN is client-side (`?lang=en` / i18n.js). ChatGPT and crawlers still see Spanish HTML until SSR/hreflang exists.

