// App.jsx
// AGIS Prototype V0.1
//
// Layout:
//   - One full-screen React Three Fiber canvas (Scene)
//   - One input box fixed at the bottom
//   - A router service (router.js) — hardcoded rules, no AI
//
// Flow:
//   User types "show cube" -> router returns {renderer:"cube"}
//   -> canvas reads it -> cube appears, camera eases to it.
//   User types "show sphere" -> router returns {renderer:"sphere"}
//   -> camera moves forward, cube fades out, sphere fades in.
//   No reloads. No dashboards. No auth. No DB. No AI.

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Scene from './Scene.jsx'
import { route } from './router.js'

const PLACEHOLDER = 'try "show cube" or "show sphere"'

export default function App() {
  const [value, setValue] = useState('')
  const [active, setActive] = useState(null) // current renderer: 'cube' | 'sphere' | null
  const [descriptor, setDescriptor] = useState(null) // last router output
  const [error, setError] = useState(null)
  const [chipVisible, setChipVisible] = useState(false)
  const inputRef = useRef(null)
  const chipTimer = useRef(null)
  const toastTimer = useRef(null)

  // Run input through the router and apply the descriptor.
  const submit = useCallback((text) => {
    const out = route(text)
    setDescriptor(out)

    if (out.error) {
      setError(out.message || 'Unknown command')
      setChipVisible(false)
      return
    }

    if (out.renderer) {
      setActive(out.renderer)
      setError(null)
      setChipVisible(true)
      clearTimeout(chipTimer.current)
      chipTimer.current = setTimeout(() => setChipVisible(false), 3200)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = value.trim()
    if (!text) return
    submit(text)
    setValue('')
  }

  // Focus input on mount only — don't steal focus from button clicks
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-dismiss error toast
  useEffect(() => {
    if (!error) return
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setError(null), 2600)
  }, [error])

  const chipClass = descriptor && !descriptor.error && chipVisible ? 'show' : ''
  const pillClass = active === 'sphere' ? 'status-pill sphere' : 'status-pill'

  return (
    <>
      {/* Full-screen 3D canvas */}
      <div className="canvas-wrap">
        <Scene active={active} />
      </div>

      <div className="vignette" />

      {/* Top status bar */}
      <div className="statusbar">
        <div className="brand">
          <span className="logo">AGIS</span>
          <span className="ver">PROTOTYPE v0.1</span>
        </div>
        <div className={pillClass}>
          <span className="dot" />
          <span>{active ? `rendering · ${active}` : 'awaiting input'}</span>
        </div>
      </div>

      {/* Center hint, shown until first object is rendered */}
      <div className={`hint${active ? ' hide' : ''}`}>
        <h1 className="big">
          Conversation <b>controls space</b>
        </h1>
        <p className="sub">type a command below · no buttons, no menus</p>
      </div>

      {/* Router output chip */}
      <div className={`response-chip ${chipClass}`}>
        {descriptor && (
          <>
            router&nbsp;»&nbsp;<span className="key">{JSON.stringify(descriptor)}</span>
          </>
        )}
      </div>

      {/* Error toast */}
      {error && <div className="toast show">{error}</div>}

      {/* Bottom input dock */}
      <div className="dock">
        <form className="dock-inner" onSubmit={handleSubmit}>
          <span className="prompt">›</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={PLACEHOLDER}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-label="AGIS command input"
          />
          <button
            className="send-btn"
            type="submit"
            disabled={!value.trim()}
            aria-label="send command"
          >
            Run
          </button>
        </form>
      </div>
    </>
  )
}
