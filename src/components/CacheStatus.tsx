import { useCallback, useEffect, useState } from 'react'
import { cacheStats, clearCache, fmtBytes } from '../lib/cache'

export function CacheStatus({ refreshKey }: { refreshKey: string }) {
  const [stats, setStats] = useState<{ entries: number; bytes: number | null } | null>(null)
  const refresh = useCallback(() => { cacheStats().then(setStats).catch(() => setStats(null)) }, [])
  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 3000) // keep up with lazily arriving images
    return () => clearInterval(t)
  }, [refresh, refreshKey])
  if (!stats || !('serviceWorker' in navigator)) return null
  return (
    <span className="cache-status">
      Local cache: {stats.entries} files{stats.bytes != null && ` · ${fmtBytes(stats.bytes)}`}
      {' '}<button onClick={async () => { await clearCache(); refresh() }}>clear</button>
    </span>
  )
}
