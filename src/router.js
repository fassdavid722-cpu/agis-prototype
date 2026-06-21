// router.js
// AGIS Prototype V0.1 — Router Service
//
// The router does NOT use AI. It maps natural-language input to a
// renderer descriptor using hardcoded rules. The output is a plain
// JSON object that the canvas reads to decide what to show.
//
// Supported inputs:
//   "show cube"   ->  { "renderer": "cube" }
//   "show sphere" ->  { "renderer": "sphere" }
//
// Unknown input returns an error descriptor so the UI can react.

const RULES = [
  {
    match: /\b(show|display|render|give|draw)\b.*\bcube\b/i,
    build: () => ({ renderer: 'cube' }),
  },
  {
    match: /\b(show|display|render|give|draw)\b.*\bsphere\b/i,
    build: () => ({ renderer: 'sphere' }),
  },
  // bare keywords as a fallback
  {
    match: /\bcube\b/i,
    build: () => ({ renderer: 'cube' }),
  },
  {
    match: /\bsphere\b/i,
    build: () => ({ renderer: 'sphere' }),
  },
]

// Router: input string -> output descriptor object.
// Pure function, synchronous, no AI, no network.
export function route(input) {
  const text = (input || '').trim()
  if (!text) {
    return { renderer: null, error: 'empty' }
  }
  for (const rule of RULES) {
    if (rule.match.test(text)) {
      return rule.build()
    }
  }
  return {
    renderer: null,
    error: 'unknown',
    message: `No rule matched: "${text}". Try "show cube" or "show sphere".`,
  }
}

// Human-readable label for a descriptor (used by the UI).
export function describe(descriptor) {
  if (!descriptor || !descriptor.renderer) return 'nothing'
  return descriptor.renderer
}
