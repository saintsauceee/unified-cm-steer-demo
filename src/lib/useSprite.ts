import { useEffect, useState } from 'react'

type S = 'loading' | 'ok' | 'error'
const done = new Map<string, S>()
const pending = new Map<string, Promise<S>>()

function load(url: string): Promise<S> {
  let p = pending.get(url)
  if (!p) {
    p = new Promise<S>((resolve) => {
      const im = new Image()
      // same request mode as the CSS background that draws it, so the browser reuses the one download
      im.decoding = 'async'
      im.onload = () => { done.set(url, 'ok'); resolve('ok') }
      im.onerror = () => { done.set(url, 'error'); pending.delete(url); resolve('error') }
      im.src = url
    })
    pending.set(url, p)
  }
  return p
}

/** Fetch sprites ahead of use (the neighbouring layer configs), so switching views paints from cache. */
export function preloadSprites(urls: string[]) { urls.forEach((u) => { void load(u) }) }

/** Load state of one sprite sheet, shared by the 20 cells that draw from it. */
export function useSprite(url: string | null): S {
  const [state, setState] = useState<S>(() => (url ? done.get(url) ?? 'loading' : 'error'))
  useEffect(() => {
    if (!url) { setState('error'); return }
    const known = done.get(url)
    if (known === 'ok') { setState('ok'); return }
    let alive = true
    setState('loading')
    void load(url).then((s) => { if (alive) setState(s) })
    return () => { alive = false }
  }, [url])
  return state
}
