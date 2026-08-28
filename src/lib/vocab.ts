export const HF_BASE =
  'https://huggingface.co/datasets/saintsauce/uniar-steering-eval/resolve/main'

export type Group = 'semantic' | 'visual'
export type Concept =
  | 'emotion' | 'age' | 'cleanness' | 'chaos'
  | 'size' | 'near_far' | 'spatial_lr'
export type Quadrant = 'img2img' | 'txt2img' | 'txt2txt' | 'img2txt'
export type LayerConfig = 'L8' | 'L16' | 'L26' | 'early4' | 'mid4' | 'late4' | 'all'

export const GROUPS: Record<Group, Concept[]> = {
  semantic: ['emotion', 'age', 'cleanness', 'chaos'],
  visual: ['size', 'near_far', 'spatial_lr'],
}
export const CONCEPTS: Concept[] = [...GROUPS.semantic, ...GROUPS.visual]
export const groupOf = (c: Concept): Group =>
  GROUPS.semantic.includes(c) ? 'semantic' : 'visual'

export const QUADRANTS: Quadrant[] = ['img2img', 'txt2img', 'txt2txt', 'img2txt']
export const isImageQuad = (q: Quadrant) => q === 'img2img' || q === 'txt2img'

export const LAYER_CONFIGS: LayerConfig[] = ['L8', 'L16', 'L26', 'early4', 'mid4', 'late4', 'all']

export const N_PROMPTS = 20
export const PROMPT_IDS = Array.from({ length: N_PROMPTS }, (_, i) => i)
export const pid = (i: number) => `p${String(i).padStart(2, '0')}`

// Image and text use different alpha grids.
const IMAGE_MAGS = [0.01, 0.02, 0.03, 0.04, 0.05]
const TEXT_MAGS = [0.05, 0.1, 0.15, 0.2, 0.25]
const grid = (mags: number[]) => [
  ...[...mags].reverse().map((m) => -m),
  0,
  ...mags,
]
export const IMAGE_ALPHAS = grid(IMAGE_MAGS) // -0.05 … 0 … +0.05
export const TEXT_ALPHAS = grid(TEXT_MAGS) // -0.25 … 0 … +0.25
export const alphasFor = (q: Quadrant) => (isImageQuad(q) ? IMAGE_ALPHAS : TEXT_ALPHAS)

/** Format alpha as it appears in paths / cell keys: a+0.03, a-0.20 */
export const alphaKey = (a: number) =>
  `a${a < 0 ? '-' : '+'}${Math.abs(a).toFixed(2)}`
export const alphaLabel = (a: number) =>
  a === 0 ? 'baseline' : `${a > 0 ? '+' : '−'}${Math.abs(a).toFixed(2)}`

export const POLES: Record<Concept, { pos: string; neg: string }> = {
  emotion: { pos: 'happy', neg: 'sad' },
  age: { pos: 'old', neg: 'young' },
  cleanness: { pos: 'dirty', neg: 'clean' },
  chaos: { pos: 'chaotic', neg: 'orderly' },
  size: { pos: 'bigger', neg: 'smaller' },
  near_far: { pos: 'closer', neg: 'farther' },
  spatial_lr: { pos: 'right', neg: 'left' },
}

// ---------- URLs ----------
export const imageUrl = (
  concept: Concept, quad: Quadrant, config: LayerConfig, alpha: number, prompt: number,
) => {
  const g = groupOf(concept)
  const base = `${HF_BASE}/steered-gen/${g}/${concept}/${quad}`
  return alpha === 0
    ? `${base}/baseline512/${pid(prompt)}.png`
    : `${base}/layer-setups/${config}/${alphaKey(alpha)}/${pid(prompt)}.png`
}

export const generationsUrl = (concept: Concept, quad: Quadrant) =>
  `${HF_BASE}/steered-gen/${groupOf(concept)}/${concept}/${quad}/generations.json`

/** Image quadrants use the long descriptive image-gen sheet; text quadrants use the short text-gen sheet. */
export const promptSheetUrl = (concept: Concept, quad: Quadrant) =>
  isImageQuad(quad)
    ? `${HF_BASE}/prompts/${concept}/${concept}.json`
    : `${HF_BASE}/prompts/${concept}/${concept}_text.json`

export interface Generations {
  prompts: string[]
  concept: string
  sub: string
  baseline: string[]
  cells: Record<string, string[]>
}
export interface PromptSheet {
  concept: string
  pos_label?: string
  neg_label?: string
  prompts: string[]
}
