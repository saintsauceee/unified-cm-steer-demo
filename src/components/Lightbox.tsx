import { useEffect } from 'react'
import type { JudgeRec } from '../lib/vocab'

export interface JudgeView { rec: JudgeRec; steeredSrc: string; baselineSrc: string }
interface Props { src: string; caption: string; onClose: () => void; judge?: JudgeView }

const READING: Record<string, string> = {
  D: 'moved toward',            // steering worked
  N: 'moved AWAY from',         // the judge answered fine; the steering went the other way
  T: 'showed no clear change in',
}

export function Lightbox({ src, caption, onClose, judge }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
  if (judge) {
    const { rec, steeredSrc, baselineSrc } = judge
    const [a, b] = rec.sia ? [steeredSrc, baselineSrc] : [baselineSrc, steeredSrc]
    return (
      <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={caption}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close (Esc)" autoFocus>×</button>
        <figure className="judge-view" onClick={(e) => e.stopPropagation()}>
          <div className="jv-pair">
            <div><div className="jv-l">A · {rec.sia ? 'steered' : 'baseline'}</div><img src={a} alt={`A (${rec.sia ? 'steered' : 'baseline'})`} crossOrigin="anonymous" /></div>
            <div><div className="jv-l">B · {rec.sia ? 'baseline' : 'steered'}</div><img src={b} alt={`B (${rec.sia ? 'baseline' : 'steered'})`} crossOrigin="anonymous" /></div>
          </div>
          <div className="jv-panel">
            <p>Asked: which represents more of <b>{rec.asked}</b> (or less of {rec.opp})?</p>
            <p className="jv-verdict">
              <span className={`jbadge big ${rec.l}`}>{rec.l}</span>
              Verdict <b>{rec.v}</b>: the steered image {READING[rec.l]} <b>{rec.steer}</b>
              {rec.l === 'N' && <em className="jv-note"> — the judge read the pair correctly; this counts as steering failure, not a judge error.</em>}
            </p>
            <pre className="jv-why">{rec.why || 'No reasoning returned.'}</pre>
          </div>
          <figcaption>{caption} · <a href={steeredSrc} target="_blank" rel="noreferrer">open steered original</a></figcaption>
        </figure>
      </div>
    )
  }
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={caption}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close (Esc)" autoFocus>×</button>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={caption} crossOrigin="anonymous" />
        <figcaption>
          {caption} · <a href={src} target="_blank" rel="noreferrer">open original</a>
        </figcaption>
      </figure>
    </div>
  )
}
