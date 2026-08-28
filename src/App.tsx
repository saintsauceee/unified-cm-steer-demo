import { useEffect, useState } from 'react'
import { Controls, type PromptSel } from './components/Controls'
import { ImageGrid } from './components/ImageGrid'
import { TextView } from './components/TextView'
import { CacheStatus } from './components/CacheStatus'
import { useFetchJson } from './lib/useFetchJson'
import {
  CONCEPTS, LAYER_CONFIGS, QUADRANTS, isImageQuad, promptSheetUrl, HF_BASE,
  type Concept, type LayerConfig, type PromptSheet, type Quadrant,
} from './lib/vocab'

interface Sel { quad: Quadrant; concept: Concept; config: LayerConfig; prompt: PromptSel }

function fromHash(): Sel {
  const p = new URLSearchParams(location.hash.replace(/^#/, ''))
  const pick = <T extends string>(k: string, all: readonly T[], d: T): T =>
    (all as readonly string[]).includes(p.get(k) ?? '') ? (p.get(k) as T) : d
  const pr = p.get('prompt')
  const prompt: PromptSel = pr === 'all' || pr === null ? 'all' : Math.min(19, Math.max(0, Number(pr) || 0))
  return {
    quad: pick('quad', QUADRANTS, 'img2img'),
    concept: pick('concept', CONCEPTS, 'emotion'),
    config: pick('config', LAYER_CONFIGS, 'L16'),
    prompt,
  }
}

export default function App() {
  const [sel, setSel] = useState<Sel>(fromHash)
  const imageQuad = isImageQuad(sel.quad)
  // Text quadrants need a single prompt.
  const prompt: PromptSel = !imageQuad && sel.prompt === 'all' ? 0 : sel.prompt

  useEffect(() => {
    const onHash = () => setSel(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const h = `#quad=${sel.quad}&concept=${sel.concept}&config=${sel.config}&prompt=${prompt}`
    if (location.hash !== h) history.replaceState(null, '', h)
  }, [sel, prompt])

  const sheet = useFetchJson<PromptSheet>(promptSheetUrl(sel.concept, sel.quad))
  const promptLabels = sheet.status === 'ok' ? sheet.data.prompts : null

  return (
    <div className="app">
      <header>
        <h1>Steering viewer</h1>
        <p className="sub">
          Live from <a href="https://huggingface.co/datasets/saintsauce/uniar-steering-eval" target="_blank" rel="noreferrer">saintsauce/uniar-steering-eval</a>
          {' '}· 7 concepts × 4 quadrants × 7 layer configs × 20 prompts × 10 alphas
        </p>
      </header>
      <Controls
        {...sel} prompt={prompt} promptLabels={promptLabels} imageQuad={imageQuad}
        onChange={(p) => setSel((s) => ({ ...s, ...p }))}
      />
      <main>
        {imageQuad
          ? <ImageGrid concept={sel.concept} quad={sel.quad} config={sel.config} prompt={prompt} promptLabels={promptLabels} />
          : <TextView concept={sel.concept} quad={sel.quad} config={sel.config} prompt={prompt as number} />}
      </main>
      <footer>
        Files resolved from <code>{HF_BASE}</code>. Images load lazily per view and are cached on this device by a service worker; missing cells show a placeholder.
        <br /><CacheStatus refreshKey={`${sel.quad}/${sel.concept}/${sel.config}/${prompt}`} />
      </footer>
    </div>
  )
}
