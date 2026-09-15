import { alphaLabel, alphaSign, POLES, textUrl, type Concept, type Generations, type ModelKey, type Quadrant } from '../lib/vocab'
import { poleCounts, segment } from '../lib/lexicon'
import { useFetchJson } from '../lib/useFetchJson'

interface Props { model: ModelKey; concept: Concept; quad: Quadrant; config: string; alphas: string[]; prompt: number }

export function TextView({ model, concept, quad, config, alphas, prompt }: Props) {
  const gen = useFetchJson<Generations>(textUrl(model, concept, quad))
  if (gen.status === 'loading' || gen.status === 'idle') return <p className="status">Loading generations…</p>
  if (gen.status === 'error') return <p className="status error">Could not load generations for {concept}/{quad}: {gen.error}</p>

  const d = gen.data
  const poles = POLES[concept]

  return (
    <div className="text-view">
      <ol className="alpha-list">
        {alphas.map((a) => {
          const s = alphaSign(a)
          const text = s === 0 ? d.baseline?.[prompt] : d.cells?.[`${config}|${a}`]?.[prompt]
          const cls = s === 0 ? 'base' : s < 0 ? 'neg' : 'pos'
          const counts = text ? poleCounts(text, concept) : null
          return (
            <li key={a} className={`alpha-row ${cls}`}>
              <div className="alpha-head">
                <span className={`chip ${cls}`}>{s === 0 ? 'baseline' : `α ${alphaLabel(a)}`}</span>
                {s !== 0 && <span className="cfg">{config}</span>}
                {counts && (
                  <span className="counts" title={`${poles.pos} / ${poles.neg} lexicon hits`}>
                    <b className="pos">{counts.pos}</b> / <b className="neg">{counts.neg}</b>
                  </span>
                )}
              </div>
              <p className="gen">
                {text
                  ? segment(text, concept).map((seg, i) =>
                      seg.pole ? <mark key={i} className={seg.pole}>{seg.text}</mark> : <span key={i}>{seg.text}</span>)
                  : text === '' ? <em className="missing">empty output</em> : <em className="missing">missing cell</em>}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
