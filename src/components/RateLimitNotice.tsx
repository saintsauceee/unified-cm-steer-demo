import { useEffect, useState } from 'react'

/** Shows when the service worker has paused image downloads after Hugging Face's rate limit (3000 files / 5 min per IP). */
export function RateLimitNotice() {
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const sw = navigator.serviceWorker
    if (!sw) return
    const onMsg = (e: MessageEvent) => { if (e.data?.type === 'hf-paused') setUntil(e.data.until as number) }
    sw.addEventListener('message', onMsg)
    return () => sw.removeEventListener('message', onMsg)
  }, [])
  useEffect(() => {
    if (until <= now) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [until, now])
  const left = Math.ceil((until - now) / 1000)
  if (left <= 0) return null
  return (
    <p className="status notice" role="status">
      Hugging Face's download limit was reached (3000 files per 5 minutes per connection). Images are queued and resume in about {left} s;
      images you have already seen load from this device's cache.
    </p>
  )
}
