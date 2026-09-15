// ---------- models: one public Hugging Face dataset repo each ----------
export type ModelKey = 'uniar' | 'emu35' | 'liquid'
export interface ModelInfo { key: ModelKey; name: string; repo: string }
export const MODELS: ModelInfo[] = [
  { key: 'uniar', name: 'UniAR', repo: 'saintsauce/unified-vlm-steering-uniar' },
  { key: 'emu35', name: 'Emu3.5', repo: 'saintsauce/unified-vlm-steering-emu35' },
  { key: 'liquid', name: 'Liquid', repo: 'saintsauce/unified-vlm-steering-liquid' },
]
export const MODEL_KEYS = MODELS.map((m) => m.key)
export const modelInfo = (m: ModelKey) => MODELS.find((x) => x.key === m) ?? MODELS[0]
export const repoPage = (m: ModelKey) => `https://huggingface.co/datasets/${modelInfo(m).repo}`
export const repoBase = (m: ModelKey) => `${repoPage(m)}/resolve/main`

export type Group = 'semantic' | 'visual'
export type Concept =
  | 'emotion' | 'age' | 'cleanness' | 'chaos'
  | 'size' | 'near_far' | 'spatial_lr'
export type Quadrant = 'img2img' | 'txt2img' | 'txt2txt' | 'img2txt'
export type ImageQuad = 'img2img' | 'txt2img'

export const GROUPS: Record<Group, Concept[]> = {
  semantic: ['emotion', 'age', 'cleanness', 'chaos'],
  visual: ['size', 'near_far', 'spatial_lr'],
}
export const CONCEPTS: Concept[] = [...GROUPS.semantic, ...GROUPS.visual]

export const QUADRANTS: Quadrant[] = ['img2img', 'txt2img', 'txt2txt', 'img2txt']
export const isImageQuad = (q: Quadrant): q is ImageQuad => q === 'img2img' || q === 'txt2img'

export const N_PROMPTS = 20
export const THUMB_SIZES = [84, 140, 220] as const
export type ThumbSize = (typeof THUMB_SIZES)[number]
export const PROMPT_IDS = Array.from({ length: N_PROMPTS }, (_, i) => i)
export const pid = (i: number) => `p${String(i).padStart(2, '0')}`

/** Alphas are the dataset's own strings (e.g. "-1.5", "10"); the sign sets the pole colour. */
export const alphaSign = (a: string) => Math.sign(parseFloat(a))
export const alphaLabel = (a: string) =>
  alphaSign(a) === 0 ? 'baseline' : `${alphaSign(a) > 0 ? '+' : '−'}${a.replace('-', '')}`

export const POLES: Record<Concept, { pos: string; neg: string }> = {
  emotion: { pos: 'happy', neg: 'sad' },
  age: { pos: 'old', neg: 'young' },
  cleanness: { pos: 'dirty', neg: 'clean' },
  chaos: { pos: 'chaotic', neg: 'orderly' },
  size: { pos: 'bigger', neg: 'smaller' },
  near_far: { pos: 'closer', neg: 'farther' },
  spatial_lr: { pos: 'right', neg: 'left' },
}

// ---------- per-model viewer index files (viewer/ in each repo) ----------
export interface LayerConfigInfo { key: string; layers: string }
export interface ViewerIndex {
  model: ModelKey; name: string; repo: string; n_prompts: number
  concepts: Concept[]
  configs: LayerConfigInfo[]
  alphas: Record<Quadrant, string[]>
  prompts: { image: Record<Concept, string[]>; text: Record<Concept, string[]> }
}
/** Image paths relative to generations/: per quadrant "<config>|<alpha>" -> one path per prompt, plus alpha=0 baselines. */
export type ImageMap = Record<ImageQuad, Record<string, string[]>> & { baseline: Record<ImageQuad, string[]> }
export interface Generations {
  concept: string; quadrant: string
  prompts: string[]
  baseline: string[]
  cells: Record<string, string[]>
}

export const indexUrl = (m: ModelKey) => `${repoBase(m)}/viewer/index.json`
export const imageMapUrl = (m: ModelKey, c: Concept) => `${repoBase(m)}/viewer/images/${c}.json`
export const textUrl = (m: ModelKey, c: Concept, q: Quadrant) => `${repoBase(m)}/viewer/text/${c}/${q}.json`
export const imageFileUrl = (m: ModelKey, rel: string) => `${repoBase(m)}/generations/${rel}`
