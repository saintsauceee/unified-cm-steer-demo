import { useEffect } from 'react'

interface Props { src: string; caption: string; onClose: () => void }

export function Lightbox({ src, caption, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
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
