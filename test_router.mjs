// test_router.mjs — AGIS Visual Translator Router v2.0 Test Suite
// Tests 20 random prompts, verifies JSON structure, reports results.

import { route } from './src/router.js'

const PROMPTS = [
  'show me a spinning cube',
  'visualize a glowing sphere',
  'draw a torus ring',
  'render a pyramid',
  'display a galaxy',
  'give me ocean waves',
  'zoom into a diamond',
  'I want to see a cylinder pipe',
  'show the ground plane',
  'orbit around a star',
  'bounce a ball',
  'show city buildings from above',
  'spin a blue cube',
  'make a mountain terrain appear',
  'zoom out from the sphere',
  'display the forest from the side',
  'show an octahedron',
  'fly through space',
  'show a cone from the front',
  'rotate the ring',
]

const REQUIRED_KEYS = ['intent', 'object', 'renderer', 'camera_action']

let passed = 0, failed = 0
const results = []

for (const prompt of PROMPTS) {
  const out = route(prompt)
  const isError = !!out.error
  const hasAllKeys = REQUIRED_KEYS.every(k => k in out)
  const isValidJSON = (() => { try { JSON.stringify(out); return true } catch { return false } })()
  const ok = hasAllKeys && isValidJSON && !isError

  if (ok) passed++; else failed++

  results.push({
    prompt,
    intent: out.intent,
    object: out.object,
    renderer: out.renderer,
    camera_action: out.camera_action,
    error: out.error || null,
    hasAllKeys,
    isValidJSON,
    status: ok ? '✅ PASS' : '❌ FAIL',
  })
}

console.log('\n══════════════════════════════════════════════════════')
console.log('   AGIS Visual Translator Router — Test Report v2.0   ')
console.log('══════════════════════════════════════════════════════\n')

results.forEach((r, i) => {
  console.log(`[${String(i+1).padStart(2,'0')}] ${r.status}  "${r.prompt}"`)
  console.log(`      intent=${r.intent}  object=${r.object}  renderer=${r.renderer}  cam=${r.camera_action}${r.error ? `  ERROR=${r.error}` : ''}`)
})

console.log('\n──────────────────────────────────────────────────────')
console.log(`  Total: ${PROMPTS.length}   ✅ Passed: ${passed}   ❌ Failed: ${failed}`)
console.log(`  Valid JSON: always (synchronous pure function)`)
console.log(`  Crashes: 0`)
console.log('══════════════════════════════════════════════════════\n')

if (failed > 0) process.exit(1)
