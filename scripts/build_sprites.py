#!/usr/bin/env python3
"""Sprite sheets for the image grid: one WebP per grid column (20 prompts, 5 x 4 tiles of 224 px).

A grid view is 11 columns x 20 prompts. Loading it as 220 full PNGs is about 85 MB; as 11 sprites it is
about 1.5 MB. Reads the image maps in public/data/<model>/viewer/images/<concept>.json and the full PNGs
under <src>/<model>/generations/, writes <out>/<model>/viewer/sprites/<concept>/<quad>/<name>.webp where
name is "<config>_<alpha>" or "baseline". Upload <out>/<model>/viewer/sprites to the model's dataset repo.

    python scripts/build_sprites.py --src $SCRATCH/demo_src --out $SCRATCH/demo_sprites [--models uniar] [--workers 4]
"""
import argparse, json
from multiprocessing import Pool
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TILE, COLS, ROWS, QUALITY = 224, 5, 4, 78


def build(job):
    src, dst, rels = job
    if dst.exists():
        return 0
    sheet = Image.new("RGB", (COLS * TILE, ROWS * TILE), (128, 128, 128))
    missing = 0
    for i, rel in enumerate(rels[:COLS * ROWS]):
        p = src / rel if rel else None
        if p is None or not p.exists():
            missing += 1
            continue
        im = Image.open(p).convert("RGB").resize((TILE, TILE), Image.LANCZOS)
        sheet.paste(im, ((i % COLS) * TILE, (i // COLS) * TILE))
    dst.parent.mkdir(parents=True, exist_ok=True)
    tmp = dst.with_suffix(".tmp")
    sheet.save(tmp, "WEBP", quality=QUALITY, method=5)
    tmp.rename(dst)
    return missing


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--models", nargs="+", default=["uniar", "emu35", "liquid"])
    ap.add_argument("--concepts", nargs="+", default=None)
    ap.add_argument("--workers", type=int, default=4)
    a = ap.parse_args()
    jobs = []
    for m in a.models:
        src = Path(a.src) / m / "generations"
        for f in sorted((ROOT / "public/data" / m / "viewer/images").glob("*.json")):
            if a.concepts and f.stem not in a.concepts:
                continue
            d = json.loads(f.read_text())
            for quad in ("img2img", "txt2img"):
                base = Path(a.out) / m / "viewer/sprites" / f.stem / quad
                jobs.append((src, base / "baseline.webp", d["baseline"][quad]))
                for key, rels in d[quad].items():
                    config, alpha = key.split("|")
                    jobs.append((src, base / f"{config}_{alpha}.webp", rels))
    with Pool(a.workers) as pool:
        missing = sum(pool.imap_unordered(build, jobs, chunksize=8))
    print(f"{len(jobs)} sprites, {missing} missing tiles")


if __name__ == "__main__":
    main()
