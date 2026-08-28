import { useCallback, useState } from 'react'
import { IMAGE_ALPHAS, alphaLabel, imageUrl, pid, type Concept, type LayerConfig, type Quadrant } from '../lib/vocab'
import { ImageCell } from './ImageCell'
import { Lightbox } from './Lightbox'
import type { PromptSel } from './Controls'

interface Props {
  concept: Concept; quad: Quadrant; config: LayerConfig; prompt: PromptSel
  promptLabels: string[] | null
}

export function ImageGrid({ concept, quad, config, prompt, promptLabels }: Props) {
  const rows = prompt === 'all' ? Array.from({ length: 20 }, (_, i) => i) : [prompt]
  const [open, setOpen] = useState<{ src: string; caption: string } | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const viewKey = `${concept}/${quad}/${config}`

  return (
    <div className="grid-wrap">
      <div className="grid-scroll">
        <table className="image-grid" key={viewKey}>
          <thead>
            <tr>
              <th className="rowhead">prompt</th>
              {IMAGE_ALPHAS.map((a) => (
                <th key={a} className={a === 0 ? 'baseline-col' : a < 0 ? 'neg-col' : 'pos-col'}>{alphaLabel(a)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p}>
                <th className="rowhead" title={promptLabels?.[p] ?? ''}>
                  <div className="pid">{pid(p)}</div>
                </th>
                {IMAGE_ALPHAS.map((a) => {
                  const src = imageUrl(concept, quad, config, a, p)
                  const caption = `${concept} · ${quad} · ${a === 0 ? 'baseline' : `${config} α=${alphaLabel(a)}`} · ${pid(p)}`
                  return (
                    <td key={a}>
                      <ImageCell src={src} alt={caption} isBaseline={a === 0} onOpen={(s) => setOpen({ src: s, caption })} />
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
