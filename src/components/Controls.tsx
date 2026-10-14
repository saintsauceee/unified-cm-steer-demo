import { useEffect, useRef, useState } from 'react'
import {
  GROUPS, MODELS, POLES, PROMPT_IDS, conceptName, pid, quadOf, sourceOf, targetOf,
  type Concept, type LayerConfigInfo, type Modality, type ModelKey, type Quadrant,
} from '../lib/vocab'

interface Props {
  model: ModelKey; quad: Quadrant; concept: Concept; config: string; prompt: number
  configs: LayerConfigInfo[]; alphas: string[]
  promptLabels: string[] | null
  onChange: (p: Partial<{ model: ModelKey; quad: Quadrant; concept: Concept; config: string; prompt: number }>) => void
}

const MODALITIES: { key: Modality; label: string }[] = [{ key: 'txt', label: 'Text' }, { key: 'img', label: 'Image' }]

function Toggle({ label, value, onPick }: { label: string; value: Modality; onPick: (m: Modality) => void }) {
  return (
    <div className="field">
      <span className="field-label" id={`lbl-${label}`}>{label}</span>
      <div className="toggle" role="group" aria-labelledby={`lbl-${label}`}>
        {MODALITIES.map((m) => (
          <button key={m.key} type="button" aria-pressed={value === m.key} onClick={() => onPick(m.key)}>{m.label}</button>
        ))}
      </div>
    </div>
  )
}

/** Prompt picker: the button shows the selected prompt in full; the list shows every prompt in full. */
function PromptPicker({ prompt, labels, onPick }: { prompt: number; labels: string[] | null; onPick: (p: number) => void }) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div className="field prompt-field" ref={box}>
      <span className="field-label" id="lbl-prompt">Prompt</span>
      <button type="button" className="prompt-button" aria-haspopup="listbox" aria-expanded={open}
        aria-labelledby="lbl-prompt" onClick={() => setOpen((o) => !o)}>
        <span className="ppid">{pid(prompt)}</span>
        <span className="ptext">{labels?.[prompt] ?? ''}</span>
        <span className="caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="prompt-list" role="listbox" aria-labelledby="lbl-prompt">
          {PROMPT_IDS.map((i) => (
            <li key={i} role="option" aria-selected={i === prompt}>
              <button type="button" onClick={() => { onPick(i); setOpen(false) }} autoFocus={i === prompt}>
                <span className="ppid">{pid(i)}</span>
                <span className="ptext">{labels?.[i] ?? ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Controls({ model, quad, concept, config, prompt, configs, alphas, promptLabels, onChange }: Props) {
  const poles = POLES[concept]
  const range = alphas.length ? `α ${alphas[0].replace('-', '−')} … +${alphas[alphas.length - 1]}` : ''
  const source = sourceOf(quad), target = targetOf(quad)
  return (
    <div className="controls">
      <div className="control-row">
        <label className="field">
          <span className="field-label">Model</span>
          <select value={model} onChange={(e) => onChange({ model: e.target.value as ModelKey })}>
            {MODELS.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
          </select>
        </label>
        <Toggle label="Vector from" value={source} onPick={(m) => onChange({ quad: quadOf(m, target) })} />
        <Toggle label="Steers" value={target} onPick={(m) => onChange({ quad: quadOf(source, m) })} />
        <label className="field">
          <span className="field-label">Concept</span>
          <select value={concept} onChange={(e) => onChange({ concept: e.target.value as Concept })}>
            {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
              <optgroup key={g} label={g}>
                {GROUPS[g].map((c) => <option key={c} value={c}>{conceptName(c)} · {POLES[c].neg} ↔ {POLES[c].pos}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Layer config</span>
          <select value={config} onChange={(e) => onChange({ config: e.target.value })} disabled={!configs.length}>
            {configs.map((c) => <option key={c.key} value={c.key}>{c.key} · {c.layers}</option>)}
          </select>
        </label>
        <div className="legend">
          <span className="key neg">−α {poles.neg}</span>
          <span className="key base">0 baseline</span>
          <span className="key pos">+α {poles.pos}</span>
          {range && <span className="range">{range}</span>}
        </div>
      </div>
      <PromptPicker prompt={prompt} labels={promptLabels} onPick={(p) => onChange({ prompt: p })} />
    </div>
  )
}
