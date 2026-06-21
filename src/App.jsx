// App.jsx — AGIS Visual Translator Router v2.0 + Code Panel + LLM-ready
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Scene from './Scene.jsx'
import { route } from './router.js'
import { getCode } from './codeGen.js'

const EXAMPLES = [
  'show me a spinning cube',
  'visualize a glowing sphere',
  'draw a torus ring',
  'render a pyramid',
  'display a galaxy',
  'give me ocean waves',
  'zoom into a diamond',
  'orbit around a star',
  'fly through space',
  'bounce a ball',
]

export default function App() {
  const [value, setValue] = useState('')
  const [descriptor, setDescriptor] = useState(null)
  const [code, setCode] = useState(null)
  const [history, setHistory] = useState([])
  const [panel, setPanel] = useState('json') // 'json' | 'code'
  const [debugOpen, setDebugOpen] = useState(true)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const [exampleIdx, setExampleIdx] = useState(0)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    const t = setInterval(() => setExampleIdx(i => (i + 1) % EXAMPLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  const submit = useCallback((text) => {
    const out = route(text)
    const c = getCode(out)
    setDescriptor(out)
    setCode(c)
    setHistory(prev => [{ text, out, code: c, ts: Date.now() }, ...prev].slice(0, 30))
    if (out.error) { setError(out.message || 'Unknown command'); return }
    setError(null)
    // Auto-switch to code panel after first render
    if (c) setPanel('code')
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = value.trim()
    if (!t) return
    submit(t)
    setValue('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const active = descriptor?.renderer || null

  return (
    <>
      <div className="canvas-wrap" onPointerUp={() => setTimeout(() => inputRef.current?.focus(), 80)}>
        <Scene descriptor={descriptor} />
      </div>
      <div className="vignette" />

      {/* Top bar */}
      <div className="statusbar">
        <div className="brand">
          <span className="logo">AGIS</span>
          <span className="ver">TRANSLATOR v2.0</span>
        </div>
        <div className={`status-pill${active ? ' active' : ''}`}>
          <span className="dot" />
          <span>{active ? `rendering · ${descriptor.object}` : 'awaiting input'}</span>
        </div>
      </div>

      {/* Center hint */}
      <div className={`hint${active ? ' hide' : ''}`}>
        <h1 className="big">Visual <b>Translator</b></h1>
        <p className="sub">type any prompt · router converts it to scene JSON + code</p>
        <p className="example">e.g. &ldquo;{EXAMPLES[exampleIdx]}&rdquo;</p>
      </div>

      {/* Debug Panel */}
      <div className={`debug-panel${debugOpen ? ' open' : ''}`}>
        <div className="debug-header" onClick={() => setDebugOpen(o => !o)}>
          <span className="debug-title">⬡ {panel === 'code' ? 'THREEJS CODE' : 'SCENE JSON'}</span>
          <div className="debug-header-right">
            {debugOpen && descriptor && !descriptor.error && (
              <div className="tab-switch" onClick={e => e.stopPropagation()}>
                <button
                  className={`tab-btn${panel === 'json' ? ' on' : ''}`}
                  onClick={() => setPanel('json')}>JSON</button>
                <button
                  className={`tab-btn${panel === 'code' ? ' on' : ''}`}
                  onClick={() => setPanel('code')}>CODE</button>
              </div>
            )}
            <span className="debug-toggle">{debugOpen ? '▲' : '▼'}</span>
          </div>
        </div>
        {debugOpen && (
          <div className="debug-body">
            {descriptor ? (
              panel === 'json' ? (
                <pre className={`scene-json${descriptor.error ? ' error' : ''}`}>
{JSON.stringify({
  intent:        descriptor.intent,
  object:        descriptor.object,
  renderer:      descriptor.renderer,
  camera_action: descriptor.camera_action,
  ...(descriptor.color ? { color: descriptor.color } : {}),
  ...(descriptor.error ? { error: descriptor.error, message: descriptor.message } : {}),
}, null, 2)}
                </pre>
              ) : (
                <pre className="scene-json code-view">
                  {code || '// generating…'}
                </pre>
              )
            ) : (
              <p className="debug-empty">No prompt yet — try one below.</p>
            )}
            <div className="history-label">HISTORY ({history.length})</div>
            <div className="history-list">
              {history.map((h) => (
                <div key={h.ts}
                     className={`history-item${h.out.error ? ' err' : ''}`}
                     onClick={() => { setDescriptor(h.out); setCode(h.code); if (h.code) setPanel('code'); setTimeout(() => inputRef.current?.focus(), 50) }}
                     title="re-run">
                  <span className="h-text">{h.text}</span>
                  <span className="h-obj">{h.out.object || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && <div className="toast show">{error}</div>}

      {/* Bottom dock */}
      <div className="dock" onClick={() => inputRef.current?.focus()}>
        <form className="dock-inner" onSubmit={handleSubmit}>
          <span className="prompt">›</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={() => setTimeout(() => inputRef.current?.focus(), 100)}
            placeholder={`try "${EXAMPLES[exampleIdx]}"`}
            autoComplete="off" autoCorrect="off" spellCheck="false"
            aria-label="AGIS prompt input"
          />
          <button className="send-btn" type="submit" disabled={!value.trim()}>Run</button>
        </form>
      </div>
    </>
  )
}
