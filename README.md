# unified-cm-steer-demo

Single-page React viewer for the public Hugging Face dataset
[`saintsauce/uniar-steering-eval`](https://huggingface.co/datasets/saintsauce/uniar-steering-eval).
All data is fetched at runtime from `huggingface.co/.../resolve/main/…` — nothing is vendored.

- Image quadrants (`img2img`, `txt2img`): prompt × alpha grid, baseline ring-marked, click for lightbox (Esc closes).
- Text quadrants (`txt2txt`, `img2txt`): baseline + alpha read-down for one prompt, pole words highlighted (amber = +pole, blue = −pole).

## Dev

```sh
npm install
npm run dev
npm run build
```

Deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.
