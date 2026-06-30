"""Convierte VTT → ASS Land Advisors: Montserrat, palabra clave en SemiBold.

Estándar REEL: ver rrss/video/PLAYBOOK-reel.md y assets/reel-defaults.json
"""
import re
import sys
from pathlib import Path

BRAND_BLUE = "&H004D2C05"
WHITE = "&H00FFFFFF"
FONT_REG = "Montserrat"
FONT_SEMI = "Montserrat SemiBold"
# Más cerca del borde inferior (820 era demasiado alto)
MARGIN_V = 480
FONT_SIZE = 56

# Palabra(s) a resaltar por orden de aparición en el VTT
HIGHLIGHTS = [
    "Land Advisors",
    "cinco terrenos",
    "miles",
    "óptimo",
    "lago",
    "portales",
    "reunión estratégica",
]


def parse_time(ts: str) -> float:
    ts = ts.strip().split()[0].replace(",", ".")
    h, m, rest = ts.split(":")
    if "." in rest:
        s, ms = rest.split(".", 1)
        frac = int(ms) / (10 ** len(ms))
    else:
        s = rest
        frac = 0.0
    return int(h) * 3600 + int(m) * 60 + int(s) + frac


def fmt_time(sec: float) -> str:
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def highlight_phrase(text: str, phrase: str) -> str:
    if not phrase or phrase.lower() not in text.lower():
        return text
    idx = text.lower().find(phrase.lower())
    before = text[:idx]
    match = text[idx : idx + len(phrase)]
    after = text[idx + len(phrase) :]
    return f"{before}{{\\rEmphasis}}{match}{{\\rDefault}}{after}"


def vtt_to_ass(vtt_path: Path, ass_path: Path, offset_sec: float) -> None:
    text = vtt_path.read_text(encoding="utf-8")
    blocks = re.split(r"\n\n+", text.strip())
    events = []
    hi_idx = 0

    for block in blocks:
        lines = block.strip().splitlines()
        if not lines or lines[0].startswith("WEBVTT") or lines[0].startswith("NOTE"):
            continue
        if "-->" in lines[0]:
            timing, content_lines = lines[0], lines[1:]
        elif len(lines) >= 2 and "-->" in lines[1]:
            timing, content_lines = lines[1], lines[2:]
        else:
            continue

        start_s, end_s = [p.strip() for p in timing.split("-->")]
        start = parse_time(start_s) + offset_sec
        end = parse_time(end_s.split()[0]) + offset_sec
        content = " ".join(l.strip() for l in content_lines if l.strip())
        content = re.sub(r"<[^>]+>", "", content)
        if not content:
            continue

        phrase = HIGHLIGHTS[hi_idx] if hi_idx < len(HIGHLIGHTS) else ""
        content = highlight_phrase(content, phrase)
        hi_idx += 1
        events.append((start, end, content))

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{FONT_REG},{FONT_SIZE},{WHITE},&H000000FF,{BRAND_BLUE},&H96000000,0,0,0,0,100,100,0,0,1,2.5,1,2,56,56,{MARGIN_V},1
Style: Emphasis,{FONT_SEMI},{FONT_SIZE},{WHITE},&H000000FF,{BRAND_BLUE},&H96000000,0,0,0,0,100,100,0,0,1,2.5,1,2,56,56,{MARGIN_V},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    dialogue_lines = [
        f"Dialogue: 0,{fmt_time(start)},{fmt_time(end)},Default,,0,0,0,,{content}"
        for start, end, content in events
    ]
    ass_path.write_text(header + "\n".join(dialogue_lines) + "\n", encoding="utf-8-sig")
    print(f"ASS: {ass_path} ({len(events)} líneas, offset {offset_sec}s, MarginV={MARGIN_V})")


if __name__ == "__main__":
    vtt = Path(sys.argv[1])
    ass = Path(sys.argv[2])
    offset = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
    vtt_to_ass(vtt, ass, offset)
