import type { Concept } from './vocab'

/** Per-concept pole lexicon (lower-case stems; matched as whole words, plural/-ly tolerant). */
export const LEXICON: Record<Concept, { pos: string[]; neg: string[] }> = {
  emotion: {
    pos: ['happy', 'happiness', 'joy', 'joyful', 'joyous', 'smile', 'smiles', 'smiling', 'grin', 'grinning',
      'cheerful', 'cheer', 'delight', 'delighted', 'delightful', 'glad', 'elated', 'elation', 'laugh', 'laughing',
      'laughter', 'beaming', 'bright', 'radiant', 'upbeat', 'jubilant', 'gleeful', 'glee', 'content', 'contented',
      'pleased', 'excited', 'excitement', 'warm', 'warmth', 'playful', 'lighthearted', 'merry', 'bliss', 'blissful',
      'celebrat', 'thrilled', 'ecstatic', 'sunny', 'optimistic', 'hopeful', 'twinkle', 'twinkling'],
    neg: ['sad', 'sadness', 'sorrow', 'sorrowful', 'gloomy', 'gloom', 'downcast', 'melancholy', 'melancholic',
      'unhappy', 'depressed', 'depression', 'mournful', 'mourning', 'grief', 'grieving', 'tear', 'tears', 'tearful',
      'crying', 'cry', 'weep', 'weeping', 'somber', 'sombre', 'dejected', 'despair', 'despairing', 'forlorn',
      'heartbroken', 'lonely', 'loneliness', 'miserable', 'misery', 'bleak', 'frown', 'frowning', 'sullen', 'wistful',
      'heavy', 'weary', 'tired', 'hopeless', 'grim', 'dim', 'dimly', 'shadow', 'shadows', 'lost', 'pain', 'painful',
      'anguish', 'sigh', 'sighing', 'lonesome', 'solemn', 'dull', 'quiet', 'silence', 'silent', 'empty', 'emptiness'],
  },
  age: {
    pos: ['old', 'older', 'elderly', 'aged', 'aging', 'ageing', 'senior', 'wrinkle', 'wrinkles', 'wrinkled', 'grey',
      'gray', 'greying', 'graying', 'white-haired', 'weathered', 'ancient', 'grandmother', 'grandfather', 'grandma',
      'grandpa', 'frail', 'cane', 'walker', 'wise', 'wisdom', 'silver', 'balding', 'bald', 'crease', 'creased',
      'creases', 'lined', 'lines', 'mature', 'veteran', 'retired', 'sagging', 'stooped', 'hunched', 'liver spots',
      'age spots', 'timeworn', 'worn', 'wizened', 'octogenarian', 'elder'],
    neg: ['young', 'younger', 'youthful', 'youth', 'child', 'children', 'kid', 'kids', 'boy', 'girl', 'toddler',
      'baby', 'infant', 'teen', 'teenager', 'teenage', 'adolescent', 'juvenile', 'little', 'small', 'tiny', 'smooth',
      'fresh', 'newborn', 'playground', 'school', 'schoolboy', 'schoolgirl', 'student', 'chubby', 'cherubic', 'giggling',
      'pigtails', 'pig-tails', 'backpack', 'crayon', 'crayons', 'toy', 'toys', 'youngster', 'lad', 'lass', 'kiddo',
      'preschool', 'kindergarten', 'baby-faced', 'boyish', 'girlish'],
  },
  cleanness: {
    pos: ['dirty', 'dirt', 'grime', 'grimy', 'filthy', 'filth', 'muddy', 'mud', 'dusty', 'dust', 'stain', 'stains',
      'stained', 'smudge', 'smudged', 'smudges', 'soiled', 'soot', 'sooty', 'greasy', 'grease', 'grubby', 'messy',
      'mess', 'unkempt', 'rusty', 'rust', 'rusted', 'tarnished', 'moldy', 'mould', 'mold', 'mildew', 'cobweb',
      'cobwebs', 'litter', 'littered', 'trash', 'garbage', 'debris', 'crumbs', 'spill', 'spilled', 'splatter',
      'splattered', 'splotch', 'smear', 'smeared', 'scuffed', 'scuff', 'worn', 'weathered', 'crusty', 'sticky',
      'gritty', 'grit', 'cluttered', 'clutter', 'squalid', 'mucky', 'muck', 'polluted', 'tattered', 'ragged',
      'dingy', 'dank', 'foul', 'stench', 'smelly'],
    neg: ['clean', 'cleaned', 'cleanly', 'spotless', 'pristine', 'immaculate', 'tidy', 'neat', 'neatly', 'polished',
      'gleaming', 'gleam', 'sparkling', 'sparkle', 'shiny', 'shine', 'shining', 'fresh', 'freshly', 'crisp', 'washed',
      'scrubbed', 'sanitized', 'sanitised', 'sterile', 'hygienic', 'spick', 'span', 'unblemished', 'flawless',
      'glossy', 'buffed', 'orderly', 'organized', 'organised', 'bright', 'white', 'lustrous', 'unstained',
      'well-kept', 'well-maintained', 'laundered', 'ironed', 'pressed', 'dust-free', 'streak-free'],
  },
  chaos: {
    pos: ['chaotic', 'chaos', 'messy', 'mess', 'cluttered', 'clutter', 'disorder', 'disordered', 'disorderly',
      'jumbled', 'jumble', 'scattered', 'strewn', 'haphazard', 'haphazardly', 'random', 'randomly', 'tangled',
      'tangle', 'frantic', 'frenzied', 'frenzy', 'wild', 'wildly', 'turbulent', 'turbulence', 'tumultuous', 'tumult',
      'disarray', 'mayhem', 'pandemonium', 'havoc', 'hectic', 'unruly', 'erratic', 'askew', 'crooked', 'toppled',
      'overturned', 'spilling', 'spilled', 'overflowing', 'piled', 'heaped', 'heap', 'crowded', 'overcrowded',
      'bustling', 'busy', 'swirling', 'whirlwind', 'explosion', 'exploding', 'burst', 'bursting', 'noisy', 'noise',
      'confusing', 'confusion', 'disheveled', 'dishevelled', 'ruffled', 'rumpled', 'wrinkled', 'crumpled', 'loose',
      'loosely', 'uneven', 'lopsided', 'sprawling', 'sprawled', 'crashing', 'clashing', 'fragmented', 'fragments',
      'shattered', 'broken', 'storm', 'stormy'],
    neg: ['orderly', 'order', 'ordered', 'neat', 'neatly', 'tidy', 'tidily', 'organized', 'organised', 'aligned',
      'alignment', 'symmetrical', 'symmetric', 'symmetry', 'arranged', 'arrangement', 'structured', 'structure',
      'systematic', 'methodical', 'precise', 'precisely', 'precision', 'calm', 'calmly', 'serene', 'serenity',
      'tranquil', 'still', 'stillness', 'composed', 'controlled', 'measured', 'balanced', 'balance', 'uniform',
      'uniformly', 'evenly', 'even', 'straight', 'grid', 'row', 'rows', 'column', 'columns', 'stacked', 'sorted',
      'labeled', 'labelled', 'regular', 'regimented', 'disciplined', 'immaculate', 'pristine', 'spotless',
      'minimal', 'minimalist', 'clean', 'geometric', 'parallel', 'squared', 'centered', 'centred', 'poised',
      'peaceful', 'quiet', 'harmonious', 'harmony', 'crisp', 'sharp', 'orderliness', 'meticulous', 'meticulously',
      'pattern', 'patterned', 'lined', 'linear'],
  },
  size: {
    pos: ['big', 'bigger', 'biggest', 'large', 'larger', 'largest', 'huge', 'enormous', 'giant', 'gigantic',
      'massive', 'immense', 'vast', 'colossal', 'towering', 'tower', 'towers', 'looming', 'loom', 'looms',
      'oversized', 'oversize', 'monumental', 'mammoth', 'grand', 'bulky', 'hulking', 'sprawling', 'expansive',
      'wide', 'tall', 'taller', 'dominates', 'dominating', 'dominant', 'fills', 'filling', 'fill', 'overwhelming',
      'imposing', 'jumbo', 'mighty', 'majestic', 'broad', 'heavy', 'thick', 'monstrous', 'titanic', 'stretching',
      'spanning', 'engulf', 'engulfing', 'whole', 'entire', 'full', 'close-up', 'closeup', 'magnified', 'zoomed'],
    neg: ['small', 'smaller', 'smallest', 'tiny', 'little', 'miniature', 'mini', 'minuscule', 'diminutive', 'petite',
      'compact', 'slight', 'wee', 'teeny', 'pint-sized', 'pocket-sized', 'dwarfed', 'dwarf', 'shrunken', 'shrunk',
      'shrinking', 'speck', 'dot', 'distant', 'faraway', 'far', 'narrow', 'thin', 'slender', 'delicate', 'dainty',
      'modest', 'subtle', 'minor', 'fine', 'micro', 'microscopic', 'toy', 'toy-like', 'toylike', 'figurine', 'bite-sized',
      'itty', 'bitty', 'barely', 'corner', 'edge', 'background', 'vast', 'expanse', 'empty', 'space', 'sky'],
  },
  near_far: {
    pos: ['close', 'closer', 'closest', 'near', 'nearer', 'nearest', 'nearby', 'close-up', 'closeup', 'up close',
      'foreground', 'front', 'immediate', 'intimate', 'intimately', 'adjacent', 'beside', 'next to', 'touching',
      'within reach', 'arm\'s length', 'right in front', 'looming', 'fills', 'filling', 'fill', 'dominates',
      'dominating', 'large', 'larger', 'big', 'bigger', 'huge', 'magnified', 'zoomed', 'zoom', 'macro', 'detail',
      'detailed', 'details', 'texture', 'textures', 'pores', 'every', 'crisp', 'sharp', 'approaching', 'approach',
      'inches', 'centimeters', 'centimetres', 'feet away', 'tight', 'tightly', 'cropped'],
    neg: ['far', 'farther', 'farthest', 'further', 'furthest', 'distant', 'distance', 'distantly', 'faraway',
      'far away', 'far-off', 'remote', 'afar', 'horizon', 'background', 'backdrop', 'beyond', 'across', 'away',
      'receding', 'recede', 'recedes', 'vanishing', 'tiny', 'small', 'smaller', 'speck', 'dot', 'blur', 'blurry',
      'blurred', 'hazy', 'haze', 'misty', 'mist', 'fog', 'foggy', 'wide', 'wide-angle', 'wide shot', 'panorama',
      'panoramic', 'vista', 'expanse', 'expansive', 'landscape', 'sprawling', 'aerial', 'bird\'s-eye', 'overview',
      'miles', 'kilometers', 'kilometres', 'yards', 'meters away', 'metres away', 'silhouette', 'silhouetted',
      'faint', 'barely visible', 'indistinct', 'isolated', 'lone', 'vast', 'stretching', 'stretches', 'open'],
  },
  spatial_lr: {
    pos: ['right', 'right-hand', 'righthand', 'rightmost', 'right side', 'right-side', 'to the right',
      'on the right', 'rightward', 'rightwards', 'east', 'eastern', 'starboard', 'clockwise', 'dexter'],
    neg: ['left', 'left-hand', 'lefthand', 'leftmost', 'left side', 'left-side', 'to the left', 'on the left',
      'leftward', 'leftwards', 'west', 'western', 'port', 'counterclockwise', 'anticlockwise', 'sinister'],
  },
}

export type Pole = 'pos' | 'neg'
export type Segment = { text: string; pole?: Pole }

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const cache = new Map<Concept, RegExp>()

function regexFor(concept: Concept): RegExp {
  let re = cache.get(concept)
  if (re) return re
  const { pos, neg } = LEXICON[concept]
  // Longest first so multi-word phrases win over single tokens.
  const alt = (ws: string[]) =>
    [...new Set(ws)].sort((a, b) => b.length - a.length).map(escapeRe).join('|')
  // Word boundary + optional common suffixes.
  re = new RegExp(
    `\\b(?<pos>(?:${alt(pos)})(?:s|es|ed|ing|ly|ness)?)\\b|\\b(?<neg>(?:${alt(neg)})(?:s|es|ed|ing|ly|ness)?)\\b`,
    'gi',
  )
  cache.set(concept, re)
  return re
}

/** Split text into segments with pole annotations for highlighting. */
export function segment(text: string, concept: Concept): Segment[] {
  const re = regexFor(concept)
  re.lastIndex = 0
  const out: Segment[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0
    if (i > last) out.push({ text: text.slice(last, i) })
    out.push({ text: m[0], pole: m.groups?.pos ? 'pos' : 'neg' })
    last = i + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}

export function poleCounts(text: string, concept: Concept) {
  let pos = 0, neg = 0
  for (const s of segment(text, concept)) {
    if (s.pole === 'pos') pos++
    else if (s.pole === 'neg') neg++
  }
  return { pos, neg }
}
