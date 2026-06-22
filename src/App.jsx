// App.jsx — AGIS v2.1 — Groq LLM only, universal renderer
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Scene from './Scene.jsx'
import { getCode } from './codeGen.js'

const EXAMPLES = [
  'show me a human face',
  'visualize a DNA helix',
  'draw a black hole',
  'render a dragon breathing fire',
  'show the Eiffel Tower',
  'give me a neural network',
  'orbit a crystal skull',
  'a melting clock',
  'fly through a nebula',
  'show me a beating heart',
  'a glowing atom',
  'Saturn with its rings',
]

async function groqRoute(prompt) {
  const res = await fetch('/api/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function App() {
  const [value, setValue] = useState('')
  const [descriptor, setDescriptor] = useState(null)
  const [code, setCode] = useState(null)
  const [history, setHistory] = useState([])
  const [panel, setPanel] = useState('json')
  const [debugOpen, setDebugOpen] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const [exIdx, setExIdx] = useState(0)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    const t = setInterval(() => setExIdx(i => (i + 1) % EXAMPLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  const submit = useCallback(async (text) => {
    setLoading(true)
    setError(null)
    let out
    try {
      out = await groqRoute(text)
      // If LLM returned an error but no renderer, keep error state
      if (!out.renderer) out.renderer = 'custom'
    } catch (e) {
      out = { error: 'network', message: e.message, raw: text, renderer: null }
    }
    const c = getCode(out)
    setDescriptor(out)
    setCode(c)
    setHistory(prev => [{ text, out, code: c, ts: Date.now() }, ...prev].slice(0, 40))
    if (out.error && out.error !== 'llm_error') setError(out.message)
    if (c) setPanel('code')
    setLoading(false)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = value.trim()
    if (!t || loading) return
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
          <span className="ver">v2.1</span>
        </div>
        <div className={`status-pill${active ? ' active' : ''}${loading ? ' loading' : ''}`}>
          <span className="dot" />
          <span>
            {loading
              ? 'Groq thinking…'
              : active
                ? `${descriptor.object}`
                : 'awaiting input'}
          </span>
        </div>
      </div>

      <div className="grok-badge">⚡ <b>Groq</b> LLaMA 3.3 · web search</div>

      {/* Center hint */}
      <div className={`hint${active || loading ? ' hide' : ''}`}>
        <h1 className="big">Visual <b>Translator</b></h1>
        <p className="sub">describe <i>anything</i> — Groq understands, router visualizes it</p>
        <p className="example">e.g. &ldquo;{EXAMPLES[exIdx]}&rdquo;</p>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-ring" />
          <p className="loading-text">Groq is thinking<span className="dots">…</span></p>
          <p className="loading-sub">generating scene descriptor · web search active</p>
        </div>
      )}

      {/* Web context pill */}
      {descriptor?.web_context && !loading && (
        <div className="web-pill">🌐 {descriptor.web_context}</div>
      )}

      {/* Debug Panel */}
      <div className={`debug-panel${debugOpen ? ' open' : ''}`}>
        <div className="debug-header" onClick={() => setDebugOpen(o => !o)}>
          <span className="debug-title">
            {panel === 'code' ? '⬡ THREE.JS CODE' : '⬡ SCENE JSON'}
            {descriptor?.llm && <span className="llm-tag">groq</span>}
          </span>
          <div className="debug-header-right">
            {debugOpen && descriptor && (
              <div className="tab-switch" onClick={e => e.stopPropagation()}>
                <button className={`tab-btn${panel === 'json' ? ' on' : ''}`} onClick={() => setPanel('json')}>JSON</button>
                <button className={`tab-btn${panel === 'code' ? ' on' : ''}`} onClick={() => setPanel('code')}>CODE</button>
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
  color:         descriptor.color,
  description:   descriptor.description,
  code_hint:     descriptor.code_hint,
  search_used:   descriptor.search_used,
  model:         descriptor.model,
}, null, 2)}
                </pre>
              ) : (
                <pre className="scene-json code-view">{code || '// no code template for this renderer'}</pre>
              )
            ) : (
              <p className="debug-empty">Type anything below — no limits.</p>
            )}

            {descriptor?.description && (
              <div className="desc-pill">💬 {descriptor.description}</div>
            )}

            <div className="history-label">HISTORY ({history.length})</div>
            <div className="history-list">
              {history.map(h => (
                <div key={h.ts}
                  className={`history-item${h.out.error ? ' err' : ' llm'}`}
                  onClick={() => {
                    setDescriptor(h.out); setCode(h.code)
                    if (h.code) setPanel('code')
                    setTimeout(() => inputRef.current?.focus(), 50)
                  }}>
                  <span className="h-text">{h.text}</span>
                  <span className="h-obj">{h.out.object || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <div className="toast show">{error}</div>}

      {/* Dock */}
      <div className="dock" onClick={() => inputRef.current?.focus()}>
        <form className="dock-inner" onSubmit={handleSubmit}>
          <span className="prompt">›</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={() => setTimeout(() => inputRef.current?.focus(), 100)}
            placeholder={loading ? 'Groq is thinking…' : `try "${EXAMPLES[exIdx]}"`}
            disabled={loading}
            autoComplete="off" autoCorrect="off" spellCheck="false"
            aria-label="AGIS prompt input"
          />
          <button className="send-btn" type="submit" disabled={!value.trim() || loading}>
            {loading ? '…' : 'Run'}
          </button>
        </form>
      </div>
    </>
  )
}
