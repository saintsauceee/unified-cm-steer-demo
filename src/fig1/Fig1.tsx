// Animated version of the paper's Figure 1. Positions are in the figure's own pixel grid (1746 x 886).
// The images are the figure's own (real minimal pairs and real model outputs); the animation only stages them.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const W = 1746, H = 886
const POS = 'var(--pos)', NEG = 'var(--neg)', ACC = 'var(--acc)', INK = 'var(--ink)'
const ACC_HEX = '#cc3311', INK_HEX = '#333333'
const B_OFFSET = 0.5            // panel (b) starts this much later
const END = 16.6 + B_OFFSET     // last animation ends
const HOLD = 4.6                // the finished figure stays this long
const FADE = 0.8
const LOOP = END + HOLD + FADE

const img = (f: string) => `${import.meta.env.BASE_URL}fig1/${f}`
const IMGS = {
  hires: img('hires.webp'), lowres: img('lowres.webp'), foodNeu: img('food_unsteered.webp'),
  foodSt: img('food_steered.webp'), personNeu: img('person_unsteered.webp'), personSt: img('person_steered.webp'),
}

// ---- timing helpers ----------------------------------------------------------------------------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const P = (t: number, s: number, d: number) => clamp((t - s) / d)
const easeOut = (x: number) => 1 - (1 - x) ** 3
const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2)
const pop = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2)  // overshoot
const fadeUp = (p: number, dy = 12): CSSProperties => ({ opacity: easeOut(p), translate: `0 ${(1 - easeOut(p)) * dy}px` })

// RdBu_r, the figure's colormap, as 11 stops
const RDBU = ['#053061', '#2065ab', '#4393c3', '#90c4dd', '#d1e5f0', '#f7f6f6', '#fddbc7', '#f3a481', '#d6604d', '#b1182b', '#67001f']
const VEC_VALS = [0.15, 0.85, 0.55, 0.95, 0.3, 0.7, 0.05, 0.6]
function cmap(v: number) {
  const x = clamp(v) * 10, i = Math.min(9, Math.floor(x)), f = x - i
  const a = RDBU[i], b = RDBU[i + 1]
  const ch = (h: string, k: number) => parseInt(h.slice(1 + 2 * k, 3 + 2 * k), 16)
  return `rgb(${[0, 1, 2].map((k) => Math.round(ch(a, k) + (ch(b, k) - ch(a, k)) * f)).join(',')})`
}

// ---- content -----------------------------------------------------------------------------------
type Seg = [string, boolean?]           // text, bold
type Line = Seg[]
type ImgItem = { kind: 'img'; src: string; x: number; y: number; w: number; h: number; color: string }
type TxtItem = {
  kind: 'txt'; lines: Line[]; x: number; y: number; w: number; h: number; color: string
  fs: number; lh: number; pad: [number, number]; note?: { words: number; perSentence: number; color: string }
}
type Item = ImgItem | TxtItem
type Pt = [number, number]

type Panel = {
  key: string; offset: number; card: [number, number, number, number]; title: string; titleX: number
  stepX: number; srcName: string
  src: { kind: 'img' } | { kind: 'txt' }
  srcBoxes: [Item & { label: string; labelX: number }, Item & { label: string; labelX: number }]
  arrow1: [Pt, Pt]; arrow2: [Pt, Pt]
  captionX: number; vec: [number, number, number, number]; vX: number
  diag: [Pt, Pt]; diagLabel: { x: number; y: number; rot: number; text: string }
  red: [Pt, Pt]; redLabel: { x: number; y: number; text: string }
  punch: { x: number; y: number; text: string }
  within: { header: { x: number; y: number; text: string }; neu: Item; st: Item; arrow: [Pt, Pt]; labelY: number }
  cross: { neu: Item; st: Item; arrow: [Pt, Pt]; labelY: number }
}

const L = (s: string): Line => s.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => (p.startsWith('**') ? [p.slice(2, -2), true] : [p]))

const PANELS: Panel[] = [
  {
    key: 'a', offset: 0, card: [20, 15, 828, 853], title: '(a)  img → txt', titleX: 434, stepX: 48, srcName: 'images',
    src: { kind: 'img' },
    srcBoxes: [
      { kind: 'img', src: IMGS.hires, x: 46, y: 181, w: 124, h: 129, color: NEG, label: 'high res', labelX: 107 },
      { kind: 'img', src: IMGS.lowres, x: 262, y: 181, w: 124, h: 129, color: POS, label: 'low res', labelX: 323 },
    ],
    arrow1: [[183, 246], [244, 246]], arrow2: [[414, 231], [518, 231]],
    captionX: 615, vec: [536, 213, 157, 39], vX: 726,
    diag: [[552, 266], [318, 508]], diagLabel: { x: 506, y: 381, rot: -46, text: 'add to img tokens' },
    red: [[633, 266], [633, 399]], redLabel: { x: 711, y: 362, text: 'add to\ntxt tokens' },
    punch: { x: 633, y: 453, text: 'same  v\nsteers text!' },
    within: {
      header: { x: 186, y: 566, text: 'steers images' },
      neu: { kind: 'img', src: IMGS.foodNeu, x: 36, y: 598, w: 124, h: 129, color: INK },
      st: { kind: 'img', src: IMGS.foodSt, x: 212, y: 598, w: 124, h: 129, color: POS },
      arrow: [[170, 662], [199, 662]], labelY: 745,
    },
    cross: {
      neu: {
        kind: 'txt', x: 389, y: 509, w: 196, h: 307, color: INK, fs: 17.4, lh: 20.7, pad: [9, 9],
        lines: ['I wake up to the', 'soft hum of the', 'city, the distant', 'clatter of traffic,', 'and the faint', 'scent of coffee',
          'and new', 'beginnings. I step', 'out onto the', 'balcony, the view', 'stretching out', 'before me. [...]'].map(L),
        note: { words: 65, perSentence: 16, color: '#333' },
      },
      st: {
        kind: 'txt', x: 639, y: 509, w: 196, h: 307, color: ACC, fs: 17.4, lh: 21.3, pad: [9, 9],
        lines: ["I'm sitting in a", 'window with a', '**blurry view** of', "the city. It's a", 'bright day, and I', 'can see some',
          'buildings in the', "background. I'm", '**not sure what**', "I'm doing, but I'm", '**just sitting**', '**there.**'].map(L),
        note: { words: 36, perSentence: 12, color: ACC_HEX },
      },
      arrow: [[597, 662], [626, 662]], labelY: 833,
    },
  },
  {
    key: 'b', offset: B_OFFSET, card: [902, 15, 828, 853], title: '(b)  txt → img', titleX: 1316, stepX: 930, srcName: 'text',
    src: { kind: 'txt' },
    srcBoxes: [
      { kind: 'txt', x: 928, y: 181, w: 124, h: 129, color: NEG, fs: 25.5, lh: 28, pad: [21, 0], lines: ['I **gotta**', 'leave', 'now.'].map(L), label: 'colloquial', labelX: 989 },
      { kind: 'txt', x: 1144, y: 181, w: 124, h: 129, color: POS, fs: 25.5, lh: 28, pad: [21, 0], lines: ['I **must**', 'leave', 'now.'].map(L), label: 'formal', labelX: 1205 },
    ],
    arrow1: [[1066, 246], [1127, 246]], arrow2: [[1296, 231], [1400, 231]],
    captionX: 1497, vec: [1418, 213, 157, 39], vX: 1608,
    diag: [[1434, 266], [1210, 508]], diagLabel: { x: 1388, y: 381, rot: -47, text: 'add to txt tokens' },
    red: [[1516, 266], [1516, 489]], redLabel: { x: 1598, y: 435, text: 'add to\nimg tokens' },
    punch: { x: 1516, y: 543, text: 'same  v\nsteers images!' },
    within: {
      header: { x: 1093, y: 538, text: 'steers text' },
      neu: {
        kind: 'txt', x: 918, y: 571, w: 148, h: 245, color: INK, fs: 18.6, lh: 21.3, pad: [6, 9],
        lines: ['**Hi**', "[Friend's", 'Name], I', 'hope', "you're", 'doing well!', "I'm **really**", '**excited** to', 'invite you', '[...]'].map(L),
      },
      st: {
        kind: 'txt', x: 1119, y: 571, w: 148, h: 245, color: POS, fs: 16, lh: 21.3, pad: [7, 9],
        lines: ['**Dear**', "[Friend's", 'Name], I', 'hope you are', 'well [...] **I**', '**am writing**', 'to extend a', 'warm', 'invitation', '[...]'].map(L),
      },
      arrow: [[1076, 692], [1105, 692]], labelY: 833,
    },
    cross: {
      neu: { kind: 'img', src: IMGS.personNeu, x: 1290, y: 599, w: 179, h: 188, color: INK },
      st: { kind: 'img', src: IMGS.personSt, x: 1521, y: 599, w: 179, h: 188, color: ACC },
      arrow: [[1479, 692], [1510, 692]], labelY: 805,
    },
  },
]

// Panel timeline (seconds from the panel's own start)
const T = {
  title: 0.1, step1: 0.4, src1: 0.9, label1: 1.2, arrow1: 1.6, ghost: 1.75, src2: 2.15, label2: 3.0,
  arrow2: 3.5, caption: 3.6, vecIn: 3.8, vecFill: 4.0, vecDone: 5.6, v: 5.6,
  step2: 6.2, diag: 6.8, header: 7.9, wNeu: 8.1, wArrow: 9.25, wSt: 9.5,
  red: 11.0, cNeu: 12.0, cArrow: 13.5, cSt: 13.8, punch: 15.7,
}

// ---- small drawing pieces ----------------------------------------------------------------------
function Arrow({ a, b, p, color = INK, lw = 3, head = [16, 8] }: { a: Pt; b: Pt; p: number; color?: string; lw?: number; head?: [number, number] }) {
  if (p <= 0) return null
  const e = easeInOut(p)
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len
  const tip: Pt = [a[0] + dx * e, a[1] + dy * e]
  const [hl, hw] = head
  const k = Math.min(1, (len * e) / hl)                                  // head grows in over its own length
  const base: Pt = [tip[0] - ux * hl * k, tip[1] - uy * hl * k]
  const pts = [tip, [base[0] - uy * hw * k, base[1] + ux * hw * k], [base[0] + uy * hw * k, base[1] - ux * hw * k]]
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={base[0] + ux * 1} y2={base[1] + uy * 1} stroke={color} strokeWidth={lw} />
      <polygon points={pts.map((q) => q.join(',')).join(' ')} fill={color} />
    </g>
  )
}

function VectorBar({ x, y, w, h, t, show, settle }: { x: number; y: number; w: number; h: number; t: number; show: number; settle: number }) {
  if (show <= 0) return null
  const cw = w / VEC_VALS.length, e = easeInOut(settle)
  return (
    <g opacity={easeOut(show)}>
      {VEC_VALS.map((v, i) => {
        const noise = 0.5 + 0.47 * Math.sin(t * 9 + i * 1.9) * Math.cos(t * 4.3 + i)
        const val = settle <= 0 ? 0.5 : v * e + noise * (1 - e)
        return <rect key={i} x={x + i * cw} y={y} width={cw} height={h} fill={settle <= 0 ? '#fff' : cmap(val)} stroke={INK_HEX} strokeWidth={1.6} />
      })}
    </g>
  )
}

function Chip({ x, y, o }: { x: number; y: number; o: number }) {                // a small copy of v riding an arrow
  if (o <= 0) return null
  const w = 56, h = 13, cw = w / VEC_VALS.length
  return (
    <g opacity={o} transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <rect x={-3} y={-3} width={w + 6} height={h + 6} rx={3} fill="#fff" opacity={0.9} />
      {VEC_VALS.map((v, i) => <rect key={i} x={i * cw} y={0} width={cw} height={h} fill={cmap(v)} stroke={INK_HEX} strokeWidth={1} />)}
    </g>
  )
}

function Pulse({ x, y, p, color }: { x: number; y: number; p: number; color: string }) {
  if (p <= 0 || p >= 1) return null
  return <circle cx={x} cy={y} r={8 + 46 * easeOut(p)} fill="none" stroke={color} strokeWidth={3 * (1 - p)} opacity={1 - p} />
}

// Image drawn token by token in raster order (as an autoregressive model emits image tokens), cursor outlined.
function RasterImage({ src, p, cursor, grid = 16 }: { src: string; p: number; cursor: string; grid?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const im = useImage(src)
  useEffect(() => {
    const c = ref.current
    if (!c || !im) return
    const n = im.naturalWidth, g = c.getContext('2d')!
    if (c.width !== n) { c.width = n; c.height = n }
    g.clearRect(0, 0, n, n)
    const total = grid * grid, k = Math.floor(p * total), s = n / grid
    const rows = Math.floor(k / grid), rest = k % grid
    if (rows) g.drawImage(im, 0, 0, n, rows * s, 0, 0, n, rows * s)
    if (rest) g.drawImage(im, 0, rows * s, rest * s, s, 0, rows * s, rest * s, s)
    if (p > 0 && p < 1) {
      g.strokeStyle = cursor; g.lineWidth = n / 70
      g.shadowColor = cursor; g.shadowBlur = n / 25
      g.strokeRect(rest * s + g.lineWidth / 2, rows * s + g.lineWidth / 2, s - g.lineWidth, s - g.lineWidth)
      g.shadowBlur = 0
    }
  }, [im, p, cursor, grid])
  return <canvas ref={ref} />
}

// The high-res photo pixelated step by step down to the low-res pair image, which then takes over.
function Pixelate({ from, to, p }: { from: string; to: string; p: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const a = useImage(from), b = useImage(to)
  useEffect(() => {
    const c = ref.current
    if (!c || !a || !b) return
    const n = a.naturalWidth, g = c.getContext('2d')!
    if (c.width !== n) { c.width = n; c.height = n }
    const q = clamp(p / 0.85)
    const blocks = Math.max(30, Math.round(n * (30 / n) ** easeInOut(q)))   // 320 -> 30 blocks across (48 px on 512)
    const off = document.createElement('canvas'); off.width = blocks; off.height = blocks
    off.getContext('2d')!.drawImage(a, 0, 0, blocks, blocks)
    g.imageSmoothingEnabled = false
    g.globalAlpha = 1
    g.drawImage(off, 0, 0, n, n)
    const f = P(p, 0.8, 0.2)
    if (f > 0) { g.globalAlpha = f; g.drawImage(b, 0, 0, n, n); g.globalAlpha = 1 }
  }, [a, b, p])
  return <canvas ref={ref} />
}

const imageCache = new Map<string, HTMLImageElement>()
function loadImage(src: string) {
  let im = imageCache.get(src)
  if (!im) { im = new Image(); im.src = src; imageCache.set(src, im) }
  return im
}
function useImage(src: string) {
  const [ready, setReady] = useState<HTMLImageElement | null>(() => { const im = loadImage(src); return im.complete && im.naturalWidth ? im : null })
  useEffect(() => {
    const im = loadImage(src)
    if (im.complete && im.naturalWidth) { setReady(im); return }
    const on = () => setReady(im)
    im.addEventListener('load', on)
    return () => im.removeEventListener('load', on)
  }, [src])
  return ready
}

// Text revealed word by word; the newest word is highlighted. Line breaks are the figure's own.
function TypedLines({ item, p, highlight }: { item: TxtItem; p: number; highlight: string }) {
  const words = useMemo(() => {
    const out: { line: number; text: string; bold: boolean }[] = []
    item.lines.forEach((line, li) => line.forEach(([s, b]) => s.split(/(?<= )/).forEach((w) => out.push({ line: li, text: w, bold: !!b }))))
    return out
  }, [item])
  const k = Math.ceil(p * words.length)
  return (
    <div className="f1-lines" style={{ left: item.pad[1], right: item.pad[1], top: item.pad[0], fontSize: item.fs, lineHeight: `${item.lh}px`, textAlign: item.pad[1] === 0 ? 'center' : 'left' }}>
      {item.lines.map((_, li) => (
        <div key={li}>
          {words.map((w, i) => w.line !== li ? null : (
            <span key={i} className="f1-word" style={{
              fontWeight: w.bold ? 700 : 400, opacity: i < k ? 1 : 0,
              background: i === k - 1 && p < 1 ? highlight : 'transparent', borderRadius: 2,
            }}>{w.text}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

function Note({ note, p, x, y }: { note: NonNullable<TxtItem['note']>; p: number; x: number; y: number }) {
  if (p <= 0) return null
  return (
    <div className="f1-note" style={{ left: x, top: y, color: note.color }}>
      {`${Math.round(note.words * p)} words total,`}
      <div style={{ opacity: P(p, 0.85, 0.15) }}>{`${note.perSentence} words per sentence`}</div>
    </div>
  )
}

function Box({ item, border, children, style }: { item: Item; border: number; children?: ReactNode; style?: CSSProperties }) {
  const radius = item.kind === 'txt' ? 6 : 0
  return (
    <div className="f1-box" style={{ left: item.x, top: item.y, width: item.w, height: item.h, borderColor: item.color, borderRadius: radius, opacity: border, ...style }}>
      {children}
    </div>
  )
}

// An output that is generated: an image in raster order, or text word by word.
function Generated({ item, p, steered, glow = 0 }: { item: Item; p: number; steered: boolean; glow?: number }) {
  const border = easeOut(clamp(p * 6))
  const style: CSSProperties = glow > 0 ? { boxShadow: `0 0 ${18 * glow}px ${4 * glow}px rgba(204, 51, 17, ${0.45 * glow})` } : {}
  if (item.kind === 'img') {
    return <Box item={item} border={border} style={style}><RasterImage src={item.src} p={clamp(p * 1.05)} cursor={steered ? ACC_HEX : INK_HEX} /></Box>
  }
  const tint = steered ? 'rgba(204, 51, 17, 0.16)' : 'rgba(0, 0, 0, 0.08)'
  return (
    <>
      <Box item={item} border={border} style={style}><TypedLines item={item} p={p} highlight={tint} /></Box>
      {item.note && <Note note={item.note} p={p} x={item.x + 12} y={item.y + item.h - 38} />}
    </>
  )
}

function scramble(target: string, p: number, t: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const fixed = Math.floor(p * (target.length + 1))
  return target.split('').map((ch, i) => (i < fixed ? ch : chars[(Math.floor(t * 22) * 7 + i * 13) % 26])).join('')
}

function Label({ x, y, text, style, className = 'f1-center' }: { x: number; y: number; text: ReactNode; style?: CSSProperties; className?: string }) {
  return <div className={`abs ${className}`} style={{ left: x, top: y, ...style }}>{text}</div>
}

// ---- one panel ---------------------------------------------------------------------------------
function PanelView({ cfg, t }: { cfg: Panel; t: number }) {
  const lt = t - cfg.offset
  const [s1, s2] = cfg.srcBoxes
  const [vx, vy, vw, vh] = cfg.vec
  const vc: Pt = [vx + vw / 2, vy + vh / 2]

  const stepIn = (s: number) => pop(P(lt, s, 0.45))
  const stepText = (s: number) => P(lt, s + 0.1, 0.6)

  // source pair
  const src1 = P(lt, T.src1, 0.6)
  const ghost = P(lt, T.ghost, 0.4)
  const src2 = P(lt, T.src2, 1.3)

  // particles stream from both sources into the vector while it is computed
  const particles: ReactNode[] = []
  if (lt > T.vecIn - 0.2 && lt < T.vecDone + 0.4) {
    const env = P(lt, T.vecIn - 0.2, 0.4) * (1 - P(lt, T.vecDone - 0.2, 0.6))
    ;[s1, s2].forEach((s, si) => {
      const a: Pt = [s.x + s.w / 2, s.y + s.h / 2]
      const c: Pt = [(a[0] + vc[0]) / 2, Math.min(a[1], vc[1]) - 95 + si * 25]
      for (let i = 0; i < 14; i++) {
        const ph = (lt * 0.8 + i / 14 + si * 0.035) % 1
        const u = easeInOut(ph)
        const x = (1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u ** 2 * vc[0]
        const y = (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u ** 2 * vc[1]
        particles.push(<circle key={`${si}-${i}`} cx={x} cy={y} r={7 - 3.5 * u} fill={s.color} opacity={env * Math.sin(Math.PI * ph) * 0.9} />)
      }
    })
  }

  // arrows that carry v
  const diagP = P(lt, T.diag, 1.0), redP = P(lt, T.red, 0.9)
  const along = (seg: [Pt, Pt], p: number): Pt => { const e = easeInOut(p); return [seg[0][0] + (seg[1][0] - seg[0][0]) * e, seg[0][1] + (seg[1][1] - seg[0][1]) * e] }
  const diagTip = along(cfg.diag, diagP), redTip = along(cfg.red, redP)
  const chipO = (p: number) => (p <= 0 || p >= 1 ? 0 : Math.min(1, p * 6, (1 - p) * 8))

  const wNeu = P(lt, T.wNeu, 1.0), wSt = P(lt, T.wSt, 1.4)
  const cNeu = P(lt, T.cNeu, 1.4), cSt = P(lt, T.cSt, 1.8)
  const punch = P(lt, T.punch, 0.55)
  const glow = punch > 0 ? Math.max(0, 1 - P(lt, T.punch + 0.3, 1.6)) : 0

  const captionP = P(lt, T.caption, 0.5)

  return (
    <>
      <div className="f1-card" style={{ left: cfg.card[0], top: cfg.card[1], width: cfg.card[2], height: cfg.card[3] }} />
      <Label x={cfg.titleX} y={41} text={cfg.title} style={{ fontSize: 34, fontWeight: 700, ...fadeUp(P(lt, T.title, 0.5), -10) }} />

      {/* step 1 */}
      <div className="abs f1-step" style={{ left: cfg.stepX - 16, top: 123 - 16, width: 32, height: 32, scale: `${stepIn(T.step1)}` }}>1</div>
      <Label className="f1-left" x={cfg.stepX + 37} y={121} text={`Extract vector from ${cfg.srcName}`}
        style={{ fontSize: 31, clipPath: `inset(-10px ${100 - 100 * easeOut(stepText(T.step1))}% -10px 0)` }} />

      {/* source pair */}
      {s1.kind === 'img' ? (
        <Box item={s1} border={easeOut(src1)} style={{ scale: `${0.94 + 0.06 * easeOut(src1)}` }}><img src={s1.src} alt="high-resolution example" /></Box>
      ) : (
        <Box item={s1} border={easeOut(clamp(src1 * 3))}><TypedLines item={s1} p={P(lt, T.src1 + 0.15, 0.55)} highlight="transparent" /></Box>
      )}
      <Label x={s1.labelX} y={342} text={s1.label} style={{ fontSize: 29, fontWeight: 700, color: s1.color, ...fadeUp(P(lt, T.label1, 0.4)) }} />

      {ghost > 0 && ghost < 1 && (
        <div className="abs" style={{ left: s1.x + (s2.x - s1.x) * easeInOut(ghost), top: s1.y, width: s1.w, height: s1.h, opacity: 0.55 * Math.sin(Math.PI * ghost), border: `3px dashed ${s1.color}` }}>
          {s1.kind === 'img' && <img src={s1.src} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />}
        </div>
      )}
      {s2.kind === 'img' && s1.kind === 'img' ? (
        <Box item={s2} border={easeOut(clamp(src2 * 5))}><Pixelate from={s1.src} to={s2.src} p={src2} /></Box>
      ) : s2.kind === 'txt' ? (
        <Box item={s2} border={easeOut(clamp(src2 * 5))}>
          <div className="f1-lines" style={{ left: 0, right: 0, top: s2.pad[0], fontSize: s2.fs, lineHeight: `${s2.lh}px`, textAlign: 'center', opacity: easeOut(clamp(src2 * 4)) }}>
            <div>I <b>{src2 >= 1 ? 'must' : scramble('must', P(src2, 0.25, 0.75), lt)}</b></div>
            <div>leave</div>
            <div>now.</div>
          </div>
        </Box>
      ) : null}
      <Label x={s2.labelX} y={342} text={s2.label} style={{ fontSize: 29, fontWeight: 700, color: s2.color, ...fadeUp(P(lt, T.label2, 0.4)) }} />

      {/* vector */}
      <Label x={cfg.captionX} y={177} text={'mean diff. of\nactivations'} style={{ fontSize: 24, color: '#333', lineHeight: 1.12, ...fadeUp(captionP, 8) }} />
      <Label x={cfg.vX} y={231} text="v" style={{ fontSize: 40, fontWeight: 700, scale: `${pop(P(lt, T.v, 0.45))}` }} />

      {/* step 2 */}
      <div className="abs f1-step" style={{ left: cfg.stepX - 16, top: 461 - 16, width: 32, height: 32, scale: `${stepIn(T.step2)}` }}>2</div>
      <div className="abs f1-left" style={{ left: cfg.stepX + 37, top: 458, fontSize: 31, lineHeight: '38px', clipPath: `inset(-10px ${100 - 100 * easeOut(stepText(T.step2))}% -10px 0)` }}>
        {'Add  '}<b>v</b>{' during\ngeneration'}
      </div>

      <div className="abs" style={{ left: cfg.diagLabel.x, top: cfg.diagLabel.y, fontSize: 22, color: '#333', whiteSpace: 'pre',
        transform: `translate(-50%, -50%) rotate(${cfg.diagLabel.rot}deg)`, clipPath: `inset(-6px ${100 - 100 * easeOut(P(lt, T.diag + 0.2, 0.8))}% -6px 0)` }}>
        {cfg.diagLabel.text}
      </div>
      <Label x={cfg.redLabel.x} y={cfg.redLabel.y} text={cfg.redLabel.text} style={{ fontSize: 22, color: ACC, lineHeight: 1.05, ...fadeUp(P(lt, T.red + 0.2, 0.6), 8) }} />

      {/* within-modality outputs */}
      <Label x={cfg.within.header.x} y={cfg.within.header.y} text={cfg.within.header.text} style={{ fontSize: 27, ...fadeUp(P(lt, T.header, 0.4)) }} />
      <Generated item={cfg.within.neu} p={wNeu} steered={false} />
      <Generated item={cfg.within.st} p={wSt} steered />
      <Label x={cfg.within.neu.x + cfg.within.neu.w / 2} y={cfg.within.labelY} text="unsteered" style={{ fontSize: 26, ...fadeUp(P(lt, T.wNeu, 0.4), 8) }} />
      <Label x={cfg.within.st.x + cfg.within.st.w / 2} y={cfg.within.labelY} text="steered" style={{ fontSize: 26, ...fadeUp(P(lt, T.wSt, 0.4), 8) }} />

      {/* cross-modality outputs */}
      <Generated item={cfg.cross.neu} p={cNeu} steered={false} />
      <Generated item={cfg.cross.st} p={cSt} steered glow={glow} />
      <Label x={cfg.cross.neu.x + cfg.cross.neu.w / 2} y={cfg.cross.labelY} text="unsteered" style={{ fontSize: 26, ...fadeUp(P(lt, T.cNeu, 0.4), 8) }} />
      <Label x={cfg.cross.st.x + cfg.cross.st.w / 2} y={cfg.cross.labelY} text="steered" style={{ fontSize: 26, ...fadeUp(P(lt, T.cSt, 0.4), 8) }} />

      <div className="abs f1-center" style={{ left: cfg.punch.x, top: cfg.punch.y, fontSize: 30, fontWeight: 700, color: ACC, lineHeight: 1.1, opacity: clamp(punch * 3), scale: `${0.4 + 0.6 * pop(punch)}` }}>
        {cfg.punch.text.split('v').map((part, i) => (i === 0 ? part : <span key={i}><b>v</b>{part}</span>))}
      </div>

      <svg className="f1-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <Arrow a={cfg.arrow1[0]} b={cfg.arrow1[1]} p={P(lt, T.arrow1, 0.4)} />
        <Arrow a={cfg.arrow2[0]} b={cfg.arrow2[1]} p={P(lt, T.arrow2, 0.5)} />
        {particles}
        <rect x={vx} y={vy} width={vw} height={vh} fill="none" stroke={INK_HEX} strokeWidth={2} opacity={P(lt, T.vecIn, 0.3)} />
        <VectorBar x={vx} y={vy} w={vw} h={vh} t={lt} show={P(lt, T.vecIn, 0.3)} settle={P(lt, T.vecFill, T.vecDone - T.vecFill)} />
        <Pulse x={vc[0]} y={vc[1]} p={P(lt, T.vecDone, 0.7)} color={INK_HEX} />

        <Arrow a={cfg.diag[0]} b={cfg.diag[1]} p={diagP} />
        <Chip x={diagTip[0]} y={diagTip[1]} o={chipO(diagP)} />
        <Pulse x={cfg.diag[1][0]} y={cfg.diag[1][1]} p={P(lt, T.diag + 1.0, 0.6)} color={INK_HEX} />
        <Arrow a={cfg.red[0]} b={cfg.red[1]} p={redP} color={ACC} lw={5} head={[20, 10]} />
        <Chip x={redTip[0]} y={redTip[1]} o={chipO(redP)} />
        <Pulse x={cfg.red[1][0]} y={cfg.red[1][1]} p={P(lt, T.red + 0.9, 0.6)} color={ACC_HEX} />

        <Arrow a={cfg.within.arrow[0]} b={cfg.within.arrow[1]} p={P(lt, T.wArrow, 0.3)} lw={2.5} head={[10, 6]} />
        <Arrow a={cfg.cross.arrow[0]} b={cfg.cross.arrow[1]} p={P(lt, T.cArrow, 0.3)} color={ACC} lw={2.5} head={[10, 6]} />
      </svg>
    </>
  )
}

// ---- clock and page ----------------------------------------------------------------------------
function useClock(ready: boolean) {
  const params = new URLSearchParams(location.search)
  const still = params.has('still')
  const start = still ? LOOP - FADE - 0.01 : Number(params.get('t') ?? 0)
  const [t, setT] = useState(start)
  const [playing, setPlaying] = useState(!still && !params.has('t'))
  const tRef = useRef(start)
  useEffect(() => {
    if (!playing || !ready) return
    let raf = 0, last = performance.now()
    const tick = (now: number) => {
      tRef.current = (tRef.current + (now - last) / 1000) % LOOP
      last = now
      setT(tRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, ready])
  const seek = (x: number) => { tRef.current = ((x % LOOP) + LOOP) % LOOP; setT(tRef.current) }
  return { t, playing, setPlaying, seek }
}

function useScale() {
  const [s, setS] = useState(1)
  useEffect(() => {
    const on = () => setS(Math.min(window.innerWidth / W, window.innerHeight / H) * 0.98)
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return s
}

export default function Fig1() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const ims = Object.values(IMGS).map(loadImage)
    Promise.all([document.fonts.ready, ...ims.map((im) => im.decode().catch(() => {}))]).then(() => setReady(true))
  }, [])
  const { t, playing, setPlaying, seek } = useClock(ready)
  const scale = useScale()
  const clean = new URLSearchParams(location.search).has('clean')

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p) }
      else if (e.key === 'ArrowRight') seek(t + 1)
      else if (e.key === 'ArrowLeft') seek(t - 1)
      else if (e.key === 'r') seek(0)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [t, seek, setPlaying])

  const fade = 1 - P(t, LOOP - FADE, FADE)
  const left = (window.innerWidth - W * scale) / 2, top = (window.innerHeight - H * scale) / 2
  return (
    <div className="f1-viewport" onClick={() => setPlaying((p) => !p)}>
      <div className="f1-stage" style={{ transform: `translate(${left}px, ${top}px) scale(${scale})`, opacity: ready ? fade : 0 }}
        role="img" aria-label="Animated Figure 1: a steering vector extracted from one modality steers generation in both image and text.">
        {PANELS.map((p) => <PanelView key={p.key} cfg={p} t={t} />)}
      </div>
      {!clean && (
        <div className="f1-bar" onClick={(e) => e.stopPropagation()}>
          <button type="button" id="f1-play" onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>
          <button type="button" id="f1-restart" onClick={() => { seek(0); setPlaying(true) }}>Restart</button>
          <div className="f1-track"><span style={{ width: `${(100 * t) / LOOP}%` }} /></div>
          <span>{t.toFixed(1)}s</span>
        </div>
      )}
    </div>
  )
}
