import { useEffect, useRef, useState } from 'react'

interface Props { src: string; alt: string; isBaseline: boolean; onOpen: (src: string) => void }

/** Lazy image: only sets `src` once scrolled near the viewport; shows a placeholder on 404. */
export function ImageCell({ src, alt, isBaseline, onOpen }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    setVisible(false); setState('loading')
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect() } },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [src])

  const cls = ['cell', isBaseline ? 'baseline' : '', state].join(' ')
  return (
    <div ref={ref} className={cls} title={alt}>
      {visible && state !== 'error' && (
        <img
          src={src} alt={alt} loading="lazy" decoding="async"
          onLoad={() => setState('ok')} onError={() => setState('error')}
          onClick={() => onOpen(src)}
        />
      )}
      {state === 'error' && <div className="placeholder">missing</div>}
      {state === 'loading' && <div className="skeleton" />}
    </div>
  )
}
