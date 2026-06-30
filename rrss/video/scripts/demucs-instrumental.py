"""Separate vocals from audio and save instrumental via soundfile (no torchcodec)."""
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from demucs.apply import apply_model
from demucs.pretrained import get_model


def load_audio(path: Path) -> tuple[torch.Tensor, int]:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(path),
                "-ac",
                "2",
                "-ar",
                "44100",
                str(tmp_path),
            ],
            check=True,
            capture_output=True,
        )
        data, sr = sf.read(str(tmp_path), always_2d=True)
    finally:
        tmp_path.unlink(missing_ok=True)

    wav = torch.from_numpy(data.T.astype(np.float32))
    return wav, sr
def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("-o", "--output", type=Path, required=True)
    args = parser.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = get_model("htdemucs")
    model.to(device)
    model.eval()

    wav, sr = load_audio(args.input)
    if wav.shape[0] == 1:
        wav = wav.repeat(2, 1)
    ref = wav.mean(0)
    wav = (wav - ref.mean()) / ref.std().clamp(min=1e-8)

    with torch.no_grad():
        sources = apply_model(model, wav[None].to(device), device=device)[0].cpu()

    # htdemucs stems: drums, bass, other, vocals
    vocals_idx = model.sources.index("vocals")
    instrumental = sum(s for i, s in enumerate(sources) if i != vocals_idx)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(args.output), instrumental.T.numpy(), sr)
    print(f"Saved: {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
