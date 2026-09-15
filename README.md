# unified-cm-steer-demo

Single-page React viewer for the final steering sweeps of three unified vision-language models, each in its own public
Hugging Face dataset repo:

- UniAR: [`saintsauce/unified-vlm-steering-uniar`](https://huggingface.co/datasets/saintsauce/unified-vlm-steering-uniar)
- Emu3.5: [`saintsauce/unified-vlm-steering-emu35`](https://huggingface.co/datasets/saintsauce/unified-vlm-steering-emu35)
- Liquid: [`saintsauce/unified-vlm-steering-liquid`](https://huggingface.co/datasets/saintsauce/unified-vlm-steering-liquid)

All data is fetched at runtime from `huggingface.co/.../resolve/main/…` — nothing is vendored. Each repo carries small index
files under `viewer/` (`index.json` with layer configs, alpha grids and prompts; `images/<concept>.json` with image paths;
`text/<concept>/<quadrant>.json` with text outputs); images are the full-resolution files under `generations/images/`.

- Pick a model, quadrant, concept, layer config and prompt; the URL hash keeps the selection.
- Image quadrants (`img2img`, `txt2img`): prompt × alpha grid, baseline ring-marked, thumbnail size switch, click for the original (Esc closes).
- Text quadrants (`txt2txt`, `img2txt`): baseline + alpha read-down for one prompt, pole words highlighted (amber = +pole, blue = −pole).

## Dev

```sh
npm install
npm run dev
npm run build
```

Deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.
