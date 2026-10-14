import { useEffect, useState, type CSSProperties } from 'react'
import { SPRITE_COLS, SPRITE_ROWS } from '../lib/vocab'
import { useSprite } from '../lib/useSprite'

interface Props {
  src: string | null; alt: string; isBaseline: boolean; onOpen: (src: string) => void; badge?: 'D' | 'N' | 'T' | null
  /** sprite sheet holding this cell's thumbnail, and its tile index in it */
  sprite?: string | null; tile?: number
}

const RETRY_DELAYS_MS = [20_000, 60_000, 120_000]

/** Image cell: native lazy loading (only fetches near the viewport). A failed download (usually Hugging Face's rate limit)
    retries on its own a few times, then offers a manual retry; "no file" is reserved for cells with no image in the sweep. */
export function ImageCell({ src, alt, isBaseline, onOpen, badge, sprite = null, tile = 0 }: Props) {
  const sp = useSprite(src ? sprite : null)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => { setState('loading'); setAttempt(0) }, [src])
  useEffect(() => {
    if (state !== 'error' || attempt >= RETRY_DELAYS_MS.length) return
    const t = setTimeout(() => { setAttempt((n) => n + 1); setState('loading') }, RETRY_DELAYS_MS[attempt])
    return () => clearTimeout(t)
  }, [state, attempt])

  if (!src) return <div className={['cell', isBaseline ? 'baseline' : '', 'error'].join(' ')} title={alt}><div className="placeholder">no file</div></div>
  const badgeEl = badge && <span className={`jbadge ${badge}`} title={badge === 'D' ? 'moved toward the steered direction' : badge === 'N' ? 'moved away from it' : 'no clear change'}>{badge}</span>
  if (sprite && sp !== 'error') {
    const style: CSSProperties = sp === 'ok' ? {
      backgroundImage: `url("${sprite}")`,
      backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
      backgroundPosition: `${((tile % SPRITE_COLS) / (SPRITE_COLS - 1)) * 100}% ${(Math.floor(tile / SPRITE_COLS) / (SPRITE_ROWS - 1)) * 100}%`,
    } : {}
    return (
      <div className={['cell', isBaseline ? 'baseline' : '', sp].join(' ')} title={alt}>
        <button type="button" className="tile" style={style} aria-label={alt} onClick={() => onOpen(src)} />
        {sp === 'loading' && <div className="skeleton" />}
        {badgeEl}
      </div>
    )
  }
  const gaveUp = state === 'error' && attempt >= RETRY_DELAYS_MS.length
  return (
    <div className={['cell', isBaseline ? 'baseline' : '', state].join(' ')} title={alt}>
      {state !== 'error' && (
        <img
          key={`${src}#${attempt}`}
          src={src} alt={alt} loading="lazy" decoding="async" crossOrigin="anonymous"
          onLoad={() => setState('ok')} onError={() => setState('error')}
          onClick={() => onOpen(src)}
        />
      )}
      {state === 'error' && (gaveUp
        ? <button type="button" className="placeholder retry" onClick={() => { setAttempt(0); setState('loading') }}>failed · retry</button>
        : <div className="placeholder">retrying…</div>)}
      {state === 'loading' && <div className="skeleton" />}
      {badgeEl}
    </div>
  )
}
