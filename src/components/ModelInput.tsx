import type { ReactNode } from 'react'
import { pid, type Concept, type ModelInputs, type Quadrant, type Tok } from '../lib/vocab'
import type { PromptSel } from './Controls'

interface Props {
  name: string; concept: Concept; quad: Quadrant; prompt: PromptSel
  inputs: ModelInputs; imagePrompts: string[] | null
}

/** Placeholder for the tokens the model generates after the input (all of them are steered). */
const Generated = ({ label }: { label: string }) =>
  <>{' '}<span className="tok-gen tok-steered" title="steered">[{label}]</span></>

/** Tokens with each run of consecutive steered tokens merged into one highlight (surrounding whitespace kept outside it). */
function renderTokens(toks: Tok[]): ReactNode[] {
  const out: ReactNode[] = []
  for (let i = 0; i < toks.length;) {
    if (!toks[i][2]) {
      out.push(<span key={i} className={`tok-${toks[i][1]}`}>{toks[i][0]}</span>)
      i++
      continue
    }
    let j = i, text = ''
    while (j < toks.length && toks[j][2]) text += toks[j++][0]
    const core = text.trim()
    if (!core) out.push(<span key={i}>{text}</span>)
    else {
      const lead = text.slice(0, text.indexOf(core)), trail = text.slice(text.indexOf(core) + core.length)
      out.push(<span key={i} className="tok-p">{lead}<span className="tok-steered" title="steered">{core}</span>{trail}</span>)
    }
    i = j
  }
  return out
}

const Legend = () =>
  <div className="mi-legend"><span className="tok-steered mi-swatch" aria-hidden="true" /> steered tokens</div>

/** Image template with special tokens set apart and `{prompt}` filled in (the image prompt itself is never steered). */
function Template({ template, prompt }: { template: string; prompt: string | null }) {
  const pieces = (s: string, k: string) =>
    s.split(/(<[^<>\s]+>)/).map((x, i) => x && <span key={`${k}${i}`} className={i % 2 ? 'tok-s' : 'tok-c'}>{x}</span>)
  const [before, after] = template.includes('{prompt}') ? template.split('{prompt}') : [template, null]
  return (
    <>
      {pieces(before, 'b')}
      {after !== null && (
        <>
          {prompt !== null ? <span className="tok-p">{prompt}</span> : <span className="tok-p placeholder-prompt">[image prompt]</span>}
          {pieces(after, 'a')}
        </>
      )}
    </>
  )
}

export function ModelInput({ name, concept, quad, prompt, inputs, imagePrompts }: Props) {
  if (quad === 'txt2txt' || quad === 'img2txt') {
    const p = prompt === 'all' ? 0 : prompt
    const toks = inputs.text.prompts[concept]?.[p]
    return (
      <section className="model-input" aria-label="Exact model input">
        <div className="mi-head">
          <b>Exact {name} input · text generation</b>
          <span className="mi-pid">{pid(p)}</span>
        </div>
        <div className="mi-label">prompt</div>
        <pre>{toks
          ? <>
              {renderTokens(toks)}
              <Generated label="generated tokens" />
            </>
          : <em className="missing">input not available</em>}
        </pre>
        <Legend />
      </section>
    )
  }
  const single = prompt === 'all' ? null : (imagePrompts?.[prompt] ?? null)
  return (
    <section className="model-input" aria-label="Exact model input">
      <div className="mi-head">
        <b>Exact {name} input · image generation</b>
        {prompt !== 'all' && <span className="mi-pid">{pid(prompt)}</span>}
      </div>
      <div className="mi-label">prompt{prompt === 'all' ? ' · pick one prompt to see it filled in' : ''}</div>
      <pre><Template template={inputs.image.cond} prompt={single} /><Generated label="generated image tokens" /></pre>
      <Legend />
    </section>
  )
}
