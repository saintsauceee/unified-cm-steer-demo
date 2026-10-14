import { useEffect, useState } from 'react'
import { Controls } from './components/Controls'
import { ImageGrid } from './components/ImageGrid'
import { TextView } from './components/TextView'
import { RateLimitNotice } from './components/RateLimitNotice'
import { useFetchJson } from './lib/useFetchJson'
import {
  CONCEPTS, MODEL_KEYS, N_PROMPTS, QUADRANTS, indexUrl, isImageQuad, modelInfo, shownAlphas,
  type Concept, type ModelKey, type Quadrant, type ViewerIndex,
} from './lib/vocab'

interface Sel { model: ModelKey; quad: Quadrant; concept: Concept; config: string; prompt: number }

function fromHash(): Sel {
  const p = new URLSearchParams(location.hash.replace(/^#/, ''))
  const pick = <T extends string>(k: string, all: readonly T[], d: T): T =>
    (all as readonly string[]).includes(p.get(k) ?? '') ? (p.get(k) as T) : d
  return {
    model: pick('model', MODEL_KEYS, 'uniar'),
    quad: pick('quad', QUADRANTS, 'img2img'),
    concept: pick('concept', CONCEPTS, 'emotion'),
    config: p.get('config') ?? '',
    prompt: Math.min(N_PROMPTS - 1, Math.max(0, Number(p.get('prompt')) || 0)),   // old "all" links open prompt 0
  }
}

export default function App() {
  const [sel, setSel] = useState<Sel>(fromHash)
  const { quad, prompt } = sel
  const imageQuad = isImageQuad(quad)

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
    const h = `#model=${sel.model}&quad=${quad}&concept=${sel.concept}&config=${config}&prompt=${prompt}`
    if (location.hash !== h) history.replaceState(null, '', h)
  }, [sel, quad, config, prompt])

  const promptLabels = idx ? idx.prompts[imageQuad ? 'image' : 'text'][sel.concept] : null
  const alphas = shownAlphas(idx?.alphas[quad] ?? [])
  const info = modelInfo(sel.model)

  return (
    <div className="app">
      <header>
        <h1>Cross-modal steering vectors</h1>
      </header>
      <Controls
        {...sel} config={config} configs={configs} alphas={alphas} promptLabels={promptLabels}
        onChange={(p) => setSel((s) => ({ ...s, ...p }))}
      />
      <main>
        <RateLimitNotice />
        {index.status === 'error' && <p className="status error">Could not load the {info.name} index ({index.error}).</p>}
        {(index.status === 'loading' || index.status === 'idle') && <p className="status">Loading the {info.name} index…</p>}
        {idx && (isImageQuad(quad)
          ? <ImageGrid model={sel.model} concept={sel.concept} quad={quad} config={config} alphas={alphas} prompt={prompt} />
          : <TextView model={sel.model} concept={sel.concept} quad={quad} config={config} alphas={alphas} prompt={prompt} />)}
      </main>
    </div>
  )
}
