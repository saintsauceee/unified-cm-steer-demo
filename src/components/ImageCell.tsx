import { useEffect, useState } from 'react'

interface Props { src: string | null; alt: string; isBaseline: boolean; onOpen: (src: string) => void }

const RETRY_DELAYS_MS = [20_000, 60_000, 120_000]

/** Image cell: native lazy loading (only fetches near the viewport). A failed download (usually Hugging Face's rate limit)
    retries on its own a few times, then offers a manual retry; "no file" is reserved for cells with no image in the sweep. */
export function ImageCell({ src, alt, isBaseline, onOpen }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => { setState('loading'); setAttempt(0) }, [src])
  useEffect(() => {
    if (state !== 'error' || attempt >= RETRY_DELAYS_MS.length) return
    const t = setTimeout(() => { setAttempt((n) => n + 1); setState('loading') }, RETRY_DELAYS_MS[attempt])
    return () => clearTimeout(t)
  }, [state, attempt])

  if (!src) return <div className={['cell', isBaseline ? 'baseline' : '', 'error'].join(' ')} title={alt}><div className="placeholder">no file</div></div>
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
    </div>
  )
}
