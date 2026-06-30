"""Concatena videos con transiciones xfade (ffmpeg)."""
import json
import subprocess
import sys
from pathlib import Path

TRANSITIONS = [
    "fade",
    "wipeleft",
    "wiperight",
    "slideup",
    "circlecrop",
    "fadeblack",
    "dissolve",
]
XFADE_DUR = 0.45


def probe_duration(path: Path, ffprobe: str) -> float:
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


def build_xfade_filter(n: int, durs: list[float]) -> str:
    if n == 1:
        return "[0:v]fps=30,scale=1080:1920,setsar=1,format=yuv420p[vout]"

    norm = []
    for i in range(n):
        norm.append(
            f"[{i}:v]fps=30,scale=1080:1920,setsar=1,format=yuv420p[v{i:02d}]"
        )

    parts = norm[:]
    prev = "[v00]"
    for i in range(1, n):
        tr = TRANSITIONS[(i - 1) % len(TRANSITIONS)]
        offset = sum(durs[:i]) - i * XFADE_DUR
        offset = max(0.05, offset)
        out = f"[vx{i:02d}]"
        parts.append(
            f"{prev}[v{i:02d}]xfade=transition={tr}:duration={XFADE_DUR}:offset={offset:.3f}{out}"
        )
        prev = out
    parts.append(f"{prev}format=yuv420p[vout]")
    return ";".join(parts)


def main() -> None:
    if len(sys.argv) < 4:
        print("Uso: python concat-xfade.py <ffprobe> <salida.mp4> <clip1> [clip2 ...]")
        sys.exit(1)

    ffprobe = sys.argv[1]
    output = Path(sys.argv[2])
    inputs = [Path(p) for p in sys.argv[3:]]
    durs = [probe_duration(p, ffprobe) for p in inputs]
    fc = build_xfade_filter(len(inputs), durs)

    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"]
    for p in inputs:
        cmd += ["-i", str(p)]
    cmd += [
        "-filter_complex",
        fc,
        "-map",
        "[vout]",
        "-c:v",
        "h264_nvenc",
        "-preset",
        "p4",
        "-cq",
        "22",
        "-movflags",
        "+faststart",
        str(output),
    ]

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError:
        cmd = [c for c in cmd if c not in ("h264_nvenc", "p4", "-cq", "22")]
        idx = cmd.index("-c:v")
        cmd[idx : idx + 8] = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "21"]
        subprocess.run(cmd, check=True)

    total = sum(durs) - XFADE_DUR * (len(durs) - 1)
    print(f"OK xfade: {output} ({len(inputs)} clips, ~{total:.1f}s)")


if __name__ == "__main__":
    main()
