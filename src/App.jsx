// App.jsx — AGIS Visual Translator Router v2.0
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Scene from './Scene.jsx'
import { route, describe } from './router.js'

const EXAMPLES = [
  'show me a spinning cube',
  'visualize a glowing sphere',
  'draw a torus ring',
  'render a pyramid',
  'display a galaxy',
  'give me ocean waves',
  'zoom into a diamond',
]

export default function App() {
  const [value, setValue] = useState('')
  const [descriptor, setDescriptor] = useState(null)
  const [history, setHistory] = useState([])
  const [debugOpen, setDebugOpen] = useState(true)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const errorTimer = useRef(null)
  const [exampleIdx, setExampleIdx] = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
    const t = setInterval(() => setExampleIdx(i => (i + 1) % EXAMPLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!error) return
    clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setError(null), 3000)
  }, [error])

  const submit = useCallback((text) => {
    const out = route(text)
    setDescriptor(out)
    setHistory(prev => [{ text, out, ts: Date.now() }, ...prev].slice(0, 30))
    if (out.error) { setError(out.message || 'Unknown command'); return }
    setError(null)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = value.trim()
    if (!t) return
    submit(t)
    setValue('')
  }

  const active = descriptor?.renderer || null

  return (
    <>
      {/* 3D Canvas */}
      <div className="canvas-wrap"><Scene descriptor={descriptor} /></div>
      <div className="vignette" />

      {/* Top bar */}
      <div className="statusbar">
        <div className="brand">
          <span className="logo">AGIS</span>
          <span className="ver">TRANSLATOR v2.0</span>
        </div>
        <div className={`status-pill${descriptor?.object === 'sphere' ? ' sphere' : ''}`}>
          <span className="dot" />
          <span>{active ? `rendering · ${descriptor.object}` : 'awaiting input'}</span>
        </div>
      </div>

      {/* Center hint */}
      <div className={`hint${active ? ' hide' : ''}`}>
        <h1 className="big">Visual <b>Translator</b></h1>
        <p className="sub">type any prompt · router converts it to scene JSON</p>
        <p className="example">e.g. &ldquo;{EXAMPLES[exampleIdx]}&rdquo;</p>
      </div>

      {/* Debug Panel */}
      <div className={`debug-panel${debugOpen ? ' open' : ''}`}>
        <div className="debug-header" onClick={() => setDebugOpen(o => !o)}>
          <span className="debug-title">⬡ SCENE JSON</span>
          <span className="debug-toggle">{debugOpen ? '▲' : '▼'}</span>
        </div>
        {debugOpen && (
          <div className="debug-body">
            {descriptor ? (
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
              <p className="debug-empty">No prompt yet — try one below.</p>
            )}
            <div className="history-label">History ({history.length})</div>
            <div className="history-list">
              {history.map((h, i) => (
                <div key={h.ts} className={`history-item${h.out.error ? ' err' : ''}`}
                     onClick={() => submit(h.text)} title="re-run">
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
      <div className="dock">
        <form className="dock-inner" onSubmit={handleSubmit}>
          <span className="prompt">›</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
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
