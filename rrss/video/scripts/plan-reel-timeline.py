"""Calcula qué clips de dron usar y cuánto recortar el último.

Regla: el video termina 4 s después de la VO (2 s cola + 2 s outro).
"""
import json
import subprocess
import sys
from pathlib import Path

XFADE_DUR = 0.45


def probe(path: Path, ffprobe: str) -> float:
    out = subprocess.check_output(
        [
            ffprobe,
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(path),
        ],
        text=True,
    )
    return float(json.loads(out)["format"]["duration"])


def main() -> None:
    if len(sys.argv) < 8:
        print(
            "Uso: plan-reel-timeline.py <ffprobe> <intro_dur> <outro_dur> "
            "<sub_offset> <vo_dur> <tail_s> <outro_s> <seg1> [seg2 ...]",
            file=sys.stderr,
        )
        sys.exit(1)

    ffprobe = sys.argv[1]
    intro_dur = float(sys.argv[2])
    outro_dur = float(sys.argv[3])
    sub_offset = float(sys.argv[4])
    vo_dur = float(sys.argv[5])
    tail_s = float(sys.argv[6])  # cola tras VO, antes del outro
    _outro_rule = float(sys.argv[7])  # redundante con outro_dur; documentación
    seg_paths = [Path(p) for p in sys.argv[8:]]

    target_total = sub_offset + vo_dur + tail_s + outro_dur
    seg_durs = [probe(p, ffprobe) for p in seg_paths]

    chosen = len(seg_paths)
    trim_last = 0.0
    for k in range(1, len(seg_paths) + 1):
        needed = target_total - intro_dur - outro_dur + (k + 1) * XFADE_DUR
        total = sum(seg_durs[:k])
        if total + 1e-6 >= needed:
            chosen = k
            trim_last = max(0.0, total - needed)
            break

    plan = {
        "target_total": round(target_total, 3),
        "vo_end": round(sub_offset + vo_dur, 3),
        "segment_count": chosen,
        "trim_last_seconds": round(trim_last, 3),
        "segments": [str(p) for p in seg_paths[:chosen]],
    }
    print(json.dumps(plan))


if __name__ == "__main__":
    main()
