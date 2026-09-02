/* Service worker: persistent on-disk cache for Hugging Face dataset files.
   - PNGs: cache-first (immutable dataset images).
   - JSON: stale-while-revalidate (serve cached, refresh in background). */
const CACHE = 'hf-steering-v2'  // bumped for the alpha*v_hat re-run (new images + long prompts)
const HF_PREFIX = 'https://huggingface.co/datasets/saintsauce/uniar-steering-eval/resolve/main/'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k)
  await self.clients.claim()
})()))

self.addEventListener('fetch', (event) => {
  const url = event.request.url
  if (event.request.method !== 'GET' || !url.startsWith(HF_PREFIX)) return
  if (url.endsWith('.png')) event.respondWith(cacheFirst(event.request))
  else if (url.endsWith('.json')) event.respondWith(staleWhileRevalidate(event.request))
})

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request.url)
  if (hit) return hit
  const res = await fetch(request.url, { mode: 'cors', credentials: 'omit' })
  if (res.ok && res.type !== 'opaque') cache.put(request.url, res.clone()).catch(() => {})
  return res
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request.url)
  const refresh = fetch(request.url, { mode: 'cors', credentials: 'omit' })
    .then((res) => { if (res.ok && res.type !== 'opaque') cache.put(request.url, res.clone()).catch(() => {}); return res })
    .catch(() => undefined)
  if (hit) { refresh.catch(() => {}); return hit }
  const res = await refresh
  return res ?? new Response('offline', { status: 503 })
}

self.addEventListener('message', async (event) => {
  if (event.data === 'clear-cache') {
    await caches.delete(CACHE)
    event.source?.postMessage('cache-cleared')
  }
})
