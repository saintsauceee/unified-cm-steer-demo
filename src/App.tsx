import { useEffect, useState } from 'react'
import { Controls, type PromptSel } from './components/Controls'
import { ImageGrid } from './components/ImageGrid'
import { TextView } from './components/TextView'
import { CacheStatus } from './components/CacheStatus'
import { useFetchJson } from './lib/useFetchJson'
import {
  CONCEPTS, MODEL_KEYS, QUADRANTS, THUMB_SIZES, indexUrl, isImageQuad, modelInfo, repoBase, repoPage,
  type Concept, type ModelKey, type Quadrant, type ThumbSize, type ViewerIndex,
} from './lib/vocab'

interface Sel { model: ModelKey; quad: Quadrant; concept: Concept; config: string; prompt: PromptSel; size: ThumbSize }

function fromHash(): Sel {
  const p = new URLSearchParams(location.hash.replace(/^#/, ''))
  const pick = <T extends string>(k: string, all: readonly T[], d: T): T =>
    (all as readonly string[]).includes(p.get(k) ?? '') ? (p.get(k) as T) : d
  const pr = p.get('prompt')
  const prompt: PromptSel = pr === 'all' || pr === null ? 'all' : Math.min(19, Math.max(0, Number(pr) || 0))
  const size = Number(p.get('size'))
  return {
    model: pick('model', MODEL_KEYS, 'uniar'),
    quad: pick('quad', QUADRANTS, 'img2img'),
    concept: pick('concept', CONCEPTS, 'emotion'),
    config: p.get('config') ?? '',
    prompt,
    size: (THUMB_SIZES as readonly number[]).includes(size) ? (size as ThumbSize) : 140,
  }
}

export default function App() {
  const [sel, setSel] = useState<Sel>(fromHash)
  const quad = sel.quad
  const imageQuad = isImageQuad(quad)
  // Text quadrants need a single prompt.
  const prompt: PromptSel = !imageQuad && sel.prompt === 'all' ? 0 : sel.prompt

  const index = useFetchJson<ViewerIndex>(indexUrl(sel.model))
  const idx = index.status === 'ok' ? index.data : null
  const configs = idx?.configs ?? []
  // Layer config names differ per model (Emu3.5 uses 8-layer windows): fall back to the model's mid window.
  const config = configs.some((c) => c.key === sel.config)
    ? sel.config
    : (configs.find((c) => c.key.startsWith('mid'))?.key ?? configs[0]?.key ?? sel.config)

  useEffect(() => {
    const onHash = () => setSel(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const h = `#model=${sel.model}&quad=${sel.quad}&concept=${sel.concept}&config=${config}&prompt=${prompt}&size=${sel.size}`
    if (location.hash !== h) history.replaceState(null, '', h)
  }, [sel, config, prompt])

  const promptLabels = idx ? idx.prompts[imageQuad ? 'image' : 'text'][sel.concept] : null
  const alphas = idx?.alphas[sel.quad] ?? []
  const info = modelInfo(sel.model)

  return (
    <div className="app">
      <header>
        <h1>Steering viewer</h1>
        <p className="sub">
          {info.name} · live from <a href={repoPage(sel.model)} target="_blank" rel="noreferrer">{info.repo}</a>
          {' '}· 7 concepts × 4 quadrants × 7 layer configs × 20 prompts × 11 α
        </p>
      </header>
      <Controls
        {...sel} config={config} prompt={prompt} configs={configs} alphas={alphas}
        promptLabels={promptLabels} imageQuad={imageQuad}
        onChange={(p) => setSel((s) => ({ ...s, ...p }))}
      />
      <main>
        {index.status === 'error' && <p className="status error">Could not load the {info.name} index ({index.error}).</p>}
        {(index.status === 'loading' || index.status === 'idle') && <p className="status">Loading the {info.name} index…</p>}
        {idx && (isImageQuad(quad)
          ? <ImageGrid model={sel.model} concept={sel.concept} quad={quad} config={config} alphas={alphas}
              prompt={prompt} promptLabels={promptLabels} size={sel.size} />
          : <TextView model={sel.model} concept={sel.concept} quad={sel.quad} config={config} alphas={alphas} prompt={prompt as number} />)}
      </main>
      <footer>
        Files resolved from <code>{repoBase(sel.model)}</code>. Thumbnails are the full-resolution files scaled down (click one for the
        original); they load lazily per view and are cached on this device by a service worker; missing cells show a placeholder.
        <br /><CacheStatus refreshKey={`${sel.model}/${sel.quad}/${sel.concept}/${config}/${prompt}`} />
      </footer>
    </div>
  )
}
