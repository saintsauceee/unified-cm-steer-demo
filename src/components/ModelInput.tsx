import { pid, type Concept, type ModelInputs, type Quadrant } from '../lib/vocab'
import type { PromptSel } from './Controls'

interface Props {
  name: string; concept: Concept; quad: Quadrant; prompt: PromptSel
  inputs: ModelInputs; imagePrompts: string[] | null
}

/** Placeholder for the tokens the model generates after the input; steered everywhere except the CFG unconditional stream. */
const Generated = ({ label, steered }: { label: string; steered: boolean }) =>
  <span className={`tok-gen${steered ? ' tok-steered' : ''}`} title={steered ? 'steered' : 'not steered'}>[{label}]</span>

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
        <pre>{toks
          ? <>
              {toks.map(([t, kind, s], i) =>
                <span key={i} className={`tok-${kind}${s ? ' tok-steered' : ''}`} title={s ? 'steered' : undefined}>{t}</span>)}
              <Generated label="generated tokens" steered />
            </>
          : <em className="missing">input not available</em>}
        </pre>
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
      <div className="mi-label">conditional{prompt === 'all' ? ' · pick one prompt to see it filled in' : ''}</div>
      <pre><Template template={inputs.image.cond} prompt={single} /><Generated label="generated image tokens" steered /></pre>
      {inputs.image.uncond !== null && (
        <>
          <div className="mi-label">unconditional (classifier-free guidance)</div>
          <pre><Template template={inputs.image.uncond} prompt={single} /><Generated label="generated image tokens" steered={false} /></pre>
        </>
      )}
    </section>
  )
}
