import { useEffect, useState } from 'react'

interface Props { src: string; alt: string; isBaseline: boolean; onOpen: (src: string) => void }

/** Image cell: native lazy loading (only fetches near the viewport); placeholder on 404. */
export function ImageCell({ src, alt, isBaseline, onOpen }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  useEffect(() => { setState('loading') }, [src])

  const cls = ['cell', isBaseline ? 'baseline' : '', state].join(' ')
  return (
    <div className={cls} title={alt}>
      {state !== 'error' && (
        <img
          key={src}
          src={src} alt={alt} loading="lazy" decoding="async" crossOrigin="anonymous"
          onLoad={() => setState('ok')} onError={() => setState('error')}
          onClick={() => onOpen(src)}
        />
      )}
      {state === 'error' && <div className="placeholder">missing</div>}
      {state === 'loading' && <div className="skeleton" />}
    </div>
  )
}
