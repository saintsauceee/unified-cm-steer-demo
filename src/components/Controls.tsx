import {
  CONCEPTS, GROUPS, LAYER_CONFIGS, POLES, PROMPT_IDS, QUADRANTS, pid,
  type Concept, type LayerConfig, type Quadrant,
} from '../lib/vocab'

export type PromptSel = 'all' | number

interface Props {
  quad: Quadrant; concept: Concept; config: LayerConfig; prompt: PromptSel
  promptLabels: string[] | null
  imageQuad: boolean
  onChange: (p: Partial<{ quad: Quadrant; concept: Concept; config: LayerConfig; prompt: PromptSel }>) => void
}

const QUAD_LABEL: Record<Quadrant, string> = {
  img2img: 'img → img', txt2img: 'txt → img', txt2txt: 'txt → txt', img2txt: 'img → txt',
}

export function Controls({ quad, concept, config, prompt, promptLabels, imageQuad, onChange }: Props) {
  const poles = POLES[concept]
  return (
    <div className="controls">
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
        <select value={config} onChange={(e) => onChange({ config: e.target.value as LayerConfig })}>
          {LAYER_CONFIGS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
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
      </div>
    </div>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export { CONCEPTS }
