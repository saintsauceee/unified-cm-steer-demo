import { useCallback, useState, type CSSProperties } from 'react'
import { alphaLabel, alphaSign, imageFileUrl, imageMapUrl, pid, type Concept, type ImageMap, type ImageQuad, type ModelKey } from '../lib/vocab'
import { useFetchJson } from '../lib/useFetchJson'
import { ImageCell } from './ImageCell'
import { Lightbox } from './Lightbox'
import type { PromptSel } from './Controls'

interface Props {
  model: ModelKey; concept: Concept; quad: ImageQuad; config: string; alphas: string[]; prompt: PromptSel
  promptLabels: string[] | null; size: number
}

export function ImageGrid({ model, concept, quad, config, alphas, prompt, promptLabels, size }: Props) {
  const map = useFetchJson<ImageMap>(imageMapUrl(model, concept))
  const rows = prompt === 'all' ? Array.from({ length: 20 }, (_, i) => i) : [prompt]
  const [open, setOpen] = useState<{ src: string; caption: string } | null>(null)
  const close = useCallback(() => setOpen(null), [])

  if (map.status === 'loading' || map.status === 'idle') return <p className="status">Loading the image index…</p>
  if (map.status === 'error') return <p className="status error">Could not load the image index for {concept}: {map.error}</p>
  const m = map.data
  const viewKey = `${model}/${concept}/${quad}/${config}`

  return (
    <div className="grid-wrap">
      <div className="grid-scroll">
        <table className="image-grid" key={viewKey} style={{ '--cell': `${size}px` } as CSSProperties}>
          <thead>
            <tr>
              <th className="rowhead">prompt</th>
              {alphas.map((a) => (
                <th key={a} className={alphaSign(a) === 0 ? 'baseline-col' : alphaSign(a) < 0 ? 'neg-col' : 'pos-col'}>{alphaLabel(a)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p}>
                <th className="rowhead" title={promptLabels?.[p] ?? ''}>
                  <div className="pid">{pid(p)}</div>
                </th>
                {alphas.map((a) => {
                  const rel = alphaSign(a) === 0 ? m.baseline[quad]?.[p] : m[quad]?.[`${config}|${a}`]?.[p]
                  const src = rel ? imageFileUrl(model, rel) : null
                  const caption = `${model} · ${concept} · ${quad} · ${alphaSign(a) === 0 ? 'baseline' : `${config} α=${alphaLabel(a)}`} · ${pid(p)}`
                  return (
                    <td key={a}>
                      <ImageCell src={src} alt={caption} isBaseline={alphaSign(a) === 0} onOpen={(s) => setOpen({ src: s, caption })} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && <Lightbox src={open.src} caption={open.caption} onClose={close} />}
    </div>
  )
}
