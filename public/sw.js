/* Service worker: persistent on-disk cache for the Hugging Face image files.
   - PNGs: cache-first (immutable dataset images).
   - Hugging Face allows anonymous clients 3000 file downloads per 5 minutes per IP; one grid is 220 images. Downloads go
     through a small queue, and a 429 (or a network error) pauses the queue and retries instead of failing the image.
   The viewer's JSON index files ship with the site itself, so they never count against that limit. */
const CACHE = 'hf-steering-v4'  // per-model repos (final sweeps of UniAR, Emu3.5, Liquid)
const HF_PREFIX = 'https://huggingface.co/datasets/saintsauce/unified-vlm-steering-'  // -uniar / -emu35 / -liquid
const MAX_PARALLEL = 8
const MAX_WAIT_MS = 4 * 60 * 1000  // browsers stop a service-worker event after ~5 min; the page retries after that

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k)
  await self.clients.claim()
})()))

self.addEventListener('fetch', (event) => {
  const url = event.request.url
  if (event.request.method !== 'GET' || !url.startsWith(HF_PREFIX) || !url.endsWith('.png')) return
  event.respondWith(cacheFirst(event.request))
})

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request.url)
  if (hit) return hit
  const res = await fetchWithRetry(request.url)
  if (res.ok && res.type !== 'opaque') cache.put(request.url, res.clone()).catch(() => {})
  return res
}

let active = 0
const waiting = []
let pausedUntil = 0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function acquire() {
  if (active < MAX_PARALLEL) { active++; return }
  await new Promise((r) => waiting.push(r))
}
function release() {
  const next = waiting.shift()
  if (next) next(); else active--
}

function retryAfterSeconds(res) {
  const ra = Number(res?.headers.get('retry-after'))
  if (ra > 0) return ra
  const t = /t=(\d+)/.exec(res?.headers.get('ratelimit') ?? '')
  return t ? Number(t[1]) + 1 : null
}

async function fetchWithRetry(url) {
  const start = Date.now()
  for (let attempt = 0; ; attempt++) {
    const wait = pausedUntil - Date.now()
    if (wait > 0) await sleep(wait)
    await acquire()
    let res
    try { res = await fetch(url, { mode: 'cors', credentials: 'omit' }) } catch { res = undefined } finally { release() }
    if (res && res.status !== 429 && res.status < 500) return res
    const delay = (retryAfterSeconds(res) ?? Math.min(120, 10 * 2 ** attempt)) * 1000
    if (Date.now() + delay - start > MAX_WAIT_MS) return res ?? Response.error()
    // A 429 from Hugging Face may arrive without CORS headers and then surfaces as a network error: pause everyone.
    if (Date.now() + delay > pausedUntil) {
      pausedUntil = Date.now() + delay
      for (const c of await self.clients.matchAll()) c.postMessage({ type: 'hf-paused', until: pausedUntil })
    }
  }
}

self.addEventListener('message', async (event) => {
  if (event.data === 'clear-cache') {
    await caches.delete(CACHE)
    event.source?.postMessage('cache-cleared')
  }
})
