import {
  GROUPS, MODELS, POLES, PROMPT_IDS, QUADRANTS, THUMB_SIZES, pid,
  type Concept, type LayerConfigInfo, type ModelKey, type Quadrant, type ThumbSize,
} from '../lib/vocab'

export type PromptSel = 'all' | number

interface Props {
  model: ModelKey; quad: Quadrant; concept: Concept; config: string; prompt: PromptSel; size: ThumbSize
  configs: LayerConfigInfo[]; alphas: string[]
  promptLabels: string[] | null
  imageQuad: boolean
  onChange: (p: Partial<{ model: ModelKey; quad: Quadrant; concept: Concept; config: string; prompt: PromptSel; size: ThumbSize }>) => void
}

const QUAD_LABEL: Record<Quadrant, string> = {
  img2img: 'img → img', txt2img: 'txt → img', txt2txt: 'txt → txt', img2txt: 'img → txt',
}
const SIZE_LABEL: Record<ThumbSize, string> = { 84: 'Small', 140: 'Medium', 220: 'Large' }

export function Controls({ model, quad, concept, config, prompt, size, configs, alphas, promptLabels, imageQuad, onChange }: Props) {
  const poles = POLES[concept]
  const range = alphas.length ? `α ${alphas[0].replace('-', '−')} … +${alphas[alphas.length - 1]}` : ''
  return (
    <div className="controls">
      <label>
        <span>Model</span>
        <select value={model} onChange={(e) => onChange({ model: e.target.value as ModelKey })}>
          {MODELS.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
        </select>
      </label>
      <label>
        <span>Quadrant</span>
        <select value={quad} onChange={(e) => onChange({ quad: e.target.value as Quadrant })}>
          <optgroup label="Image output">
            {QUADRANTS.filter((q) => q.endsWith('img')).map((q) => <option key={q} value={q}>{QUAD_LABEL[q]}</option>)}
          </optgroup>
          <optgroup label="Text output">
            {QUADRANTS.filter((q) => q.endsWith('txt')).map((q) => <option key={q} value={q}>{QUAD_LABEL[q]}</option>)}
          </optgroup>
        </select>
      </label>
      <label>
        <span>Concept</span>
        <select value={concept} onChange={(e) => onChange({ concept: e.target.value as Concept })}>
          {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
            <optgroup key={g} label={g}>
              {GROUPS[g].map((c) => <option key={c} value={c}>{c} · {POLES[c].neg} ↔ {POLES[c].pos}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <label>
        <span>Layer config</span>
        <select value={config} onChange={(e) => onChange({ config: e.target.value })} disabled={!configs.length}>
          {configs.map((c) => <option key={c.key} value={c.key}>{c.key} · {c.layers}</option>)}
        </select>
      </label>
      {imageQuad && (
        <label>
          <span>Thumbnails</span>
          <select value={size} onChange={(e) => onChange({ size: Number(e.target.value) as ThumbSize })}>
            {THUMB_SIZES.map((s) => <option key={s} value={s}>{SIZE_LABEL[s]} · {s}px</option>)}
          </select>
        </label>
      )}
      <label className="prompt-label">
        <span>Prompt</span>
        <select
          value={prompt === 'all' ? 'all' : String(prompt)}
          onChange={(e) => onChange({ prompt: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
        >
          {imageQuad && <option value="all">All 20 prompts</option>}
          {PROMPT_IDS.map((i) => (
            <option key={i} value={i}>
              {pid(i)}{promptLabels?.[i] ? ` — ${truncate(promptLabels[i], 70)}` : ''}
            </option>
          ))}
        </select>
      </label>
      <div className="legend">
        <span className="chip neg">−α → {poles.neg}</span>
        <span className="chip base">0 baseline</span>
        <span className="chip pos">+α → {poles.pos}</span>
        {range && <span className="range">{range}</span>}
      </div>
    </div>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
