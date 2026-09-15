import { useEffect, useState } from 'react'

interface Props { src: string | null; alt: string; isBaseline: boolean; onOpen: (src: string) => void }

/** Image cell: native lazy loading (only fetches near the viewport); placeholder when the file is missing or fails. */
export function ImageCell({ src, alt, isBaseline, onOpen }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(src ? 'loading' : 'error')
  useEffect(() => { setState(src ? 'loading' : 'error') }, [src])

  const cls = ['cell', isBaseline ? 'baseline' : '', state].join(' ')
  return (
    <div className={cls} title={alt}>
      {src && state !== 'error' && (
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
