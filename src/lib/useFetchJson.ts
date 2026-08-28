import { useEffect, useState } from 'react'

const cache = new Map<string, unknown>()

export type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; data: T }
  | { status: 'error'; error: string }

export function useFetchJson<T>(url: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>(() =>
    url && cache.has(url) ? { status: 'ok', data: cache.get(url) as T } : { status: url ? 'loading' : 'idle' },
  )
  useEffect(() => {
    if (!url) { setState({ status: 'idle' }); return }
    if (cache.has(url)) { setState({ status: 'ok', data: cache.get(url) as T }); return }
    let alive = true
    setState({ status: 'loading' })
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return (await r.json()) as T
      })
      .then((data) => { cache.set(url, data); if (alive) setState({ status: 'ok', data }) })
      .catch((e: unknown) => { if (alive) setState({ status: 'error', error: e instanceof Error ? e.message : String(e) }) })
    return () => { alive = false }
  }, [url])
  return state
}
