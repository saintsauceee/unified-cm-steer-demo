export const CACHE_NAME = 'hf-steering-v2'

export function registerSW() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => {})
}

export async function cacheStats(): Promise<{ entries: number; bytes: number | null }> {
  if (!('caches' in window)) return { entries: 0, bytes: null }
  const cache = await caches.open(CACHE_NAME)
  const keys = await cache.keys()
  let bytes: number | null = null
  if (navigator.storage?.estimate) {
    const est = await navigator.storage.estimate()
    bytes = est.usage ?? null
  }
  return { entries: keys.length, bytes }
}

export async function clearCache() {
  if ('caches' in window) await caches.delete(CACHE_NAME)
}

export const fmtBytes = (b: number) =>
  b < 1024 ** 2 ? `${(b / 1024).toFixed(0)} KB` : b < 1024 ** 3 ? `${(b / 1024 ** 2).toFixed(1)} MB` : `${(b / 1024 ** 3).toFixed(2)} GB`
