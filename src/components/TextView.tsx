import { TEXT_ALPHAS, alphaKey, alphaLabel, generationsUrl, pid, POLES,
  type Concept, type Generations, type LayerConfig, type Quadrant } from '../lib/vocab'
import { poleCounts, segment } from '../lib/lexicon'
import { useFetchJson } from '../lib/useFetchJson'

interface Props { concept: Concept; quad: Quadrant; config: LayerConfig; prompt: number }

export function TextView({ concept, quad, config, prompt }: Props) {
  const gen = useFetchJson<Generations>(generationsUrl(concept, quad))
  if (gen.status === 'loading' || gen.status === 'idle') return <p className="status">Loading generations.json…</p>
  if (gen.status === 'error') return <p className="status error">Could not load generations for {concept}/{quad}: {gen.error}</p>

  const d = gen.data
  const promptText = d.prompts?.[prompt] ?? ''
  const baseline = d.baseline?.[prompt]
  const poles = POLES[concept]

  return (
    <div className="text-view">
      <div className="prompt-box">
        <div className="pid">{pid(prompt)}</div>
        <div className="ptext">{promptText || <em>(no prompt text)</em>}</div>
      </div>
      <ol className="alpha-list">
        {TEXT_ALPHAS.map((a) => {
          const text = a === 0 ? baseline : d.cells?.[`${config}|${alphaKey(a)}`]?.[prompt]
          const cls = a === 0 ? 'base' : a < 0 ? 'neg' : 'pos'
          const counts = text ? poleCounts(text, concept) : null
          return (
            <li key={a} className={`alpha-row ${cls}`}>
              <div className="alpha-head">
                <span className={`chip ${cls}`}>{a === 0 ? 'baseline' : `α ${alphaLabel(a)}`}</span>
                {a !== 0 && <span className="cfg">{config}</span>}
                {counts && (
                  <span className="counts" title={`${poles.pos} / ${poles.neg} lexicon hits`}>
                    <b className="pos">{counts.pos}</b> / <b className="neg">{counts.neg}</b>
                  </span>
                )}
              </div>
              <p className="gen">
                {text
                  ? segment(text, concept).map((s, i) =>
                      s.pole ? <mark key={i} className={s.pole}>{s.text}</mark> : <span key={i}>{s.text}</span>)
                  : <em className="missing">missing cell</em>}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
