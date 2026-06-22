// App.jsx — AGIS Visual Translator v2.0 — Grok LLM + Web Search + Code Panel
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Scene from './Scene.jsx'
import { route } from './router.js'
import { getCode } from './codeGen.js'
import { groqRoute as grokRoute } from './grokRouter.js'

const EXAMPLES = [
  'show me a human face',
  'visualize a DNA helix',
  'draw a solar system',
  'render a dragon',
  'show the Eiffel Tower',
  'display a black hole',
  'give me a neural network',
  'orbit a crystal skull',
  'make a melting clock',
  'fly through a nebula',
]

export default function App() {
  const [value, setValue] = useState('')
  const [descriptor, setDescriptor] = useState(null)
  const [code, setCode] = useState(null)
  const [history, setHistory] = useState([])
  const [panel, setPanel] = useState('json')
  const [debugOpen, setDebugOpen] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [webContext, setWebContext] = useState(null)
  const inputRef = useRef(null)
  const [exampleIdx, setExampleIdx] = useState(0)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    const t = setInterval(() => setExampleIdx(i => (i + 1) % EXAMPLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  const submit = useCallback(async (text) => {
    setLoading(true)
    setError(null)
    setWebContext(null)

    let out
    try {
      // Try Grok LLM first
      out = await grokRoute(text)
      if (out.error === 'llm_error' || !out.renderer) {
        // Fallback to local router
        out = route(text)
        out.fallback = true
      }
    } catch {
      out = route(text)
      out.fallback = true
    }

    const c = getCode(out)
    setDescriptor(out)
    setCode(c)
    if (out.web_context) setWebContext(out.web_context)
    setHistory(prev => [{ text, out, code: c, ts: Date.now() }, ...prev].slice(0, 30))

    if (out.error && !out.renderer) {
      setError(out.message || 'Could not visualize that')
    }
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
          <span className="ver">TRANSLATOR v2.0</span>
        </div>
        <div className={`status-pill${active ? ' active' : ''}${loading ? ' loading' : ''}`}>
          <span className="dot" />
          <span>
            {loading ? 'thinking…' : active ? `rendering · ${descriptor.object}` : 'awaiting input'}
          </span>
        </div>
      </div>

      {/* Grok badge */}
      <div className="grok-badge">
        ⚡ powered by <b>Groq LLaMA 3.3</b> + web search
      </div>

      {/* Center hint */}
      <div className={`hint${active || loading ? ' hide' : ''}`}>
        <h1 className="big">Visual <b>Translator</b></h1>
        <p className="sub">describe <i>anything</i> · Grok searches + generates scene JSON + code</p>
        <p className="example">e.g. &ldquo;{EXAMPLES[exampleIdx]}&rdquo;</p>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-ring" />
          <p className="loading-text">Grok is thinking<span className="dots">...</span></p>
          <p className="loading-sub">searching the web · building scene JSON</p>
        </div>
      )}

      {/* Web context pill */}
      {webContext && !loading && (
        <div className="web-pill">
          🌐 {webContext}
        </div>
      )}

      {/* Debug Panel */}
      <div className={`debug-panel${debugOpen ? ' open' : ''}`}>
        <div className="debug-header" onClick={() => setDebugOpen(o => !o)}>
          <span className="debug-title">
            {panel === 'code' ? '⬡ THREEJS CODE' : '⬡ SCENE JSON'}
            {descriptor?.llm && <span className="llm-tag">grok</span>}
            {descriptor?.fallback && <span className="fallback-tag">local</span>}
          </span>
          <div className="debug-header-right">
            {debugOpen && descriptor && !descriptor.error && (
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
  web_context:   descriptor.web_context,
  llm_mode:      !!descriptor.llm,
  ...(descriptor.error ? { error: descriptor.error, message: descriptor.message } : {}),
}, null, 2)}
                </pre>
              ) : (
                <pre className="scene-json code-view">{code || '// generating…'}</pre>
              )
            ) : (
              <p className="debug-empty">No prompt yet — try anything below.</p>
            )}

            {descriptor?.description && (
              <div className="desc-pill">💬 {descriptor.description}</div>
            )}

            <div className="history-label">HISTORY ({history.length})</div>
            <div className="history-list">
              {history.map((h) => (
                <div key={h.ts}
                     className={`history-item${h.out.error ? ' err' : ''}${h.out.llm ? ' llm' : ''}`}
                     onClick={() => { setDescriptor(h.out); setCode(h.code); if (h.code) setPanel('code'); if (h.out.web_context) setWebContext(h.out.web_context); setTimeout(() => inputRef.current?.focus(), 50) }}
                     title="re-render">
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
            placeholder={loading ? 'Grok is thinking…' : `try "${EXAMPLES[exampleIdx]}"`}
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
