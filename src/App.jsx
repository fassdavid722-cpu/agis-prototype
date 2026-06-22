// App.jsx — AGIS v3.0 — Interactive Visual Intelligence Workspace
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Scene from './Scene.jsx'
import ContextMenu from './ContextMenu.jsx'
import ChatPanel from './ChatPanel.jsx'
import { useSceneStore } from './useSceneStore.js'

// ── API helpers ──────────────────────────────────────────────────────────────
async function groqRoute(prompt) {
  const res = await fetch('/api/route', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function groqChat(systemPrompt, messages) {
  const res = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: systemPrompt, messages }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Build object list from scene descriptor ──────────────────────────────────
function buildObjects(descriptor) {
  if (!descriptor || !descriptor.object) return []
  const name = descriptor.object
  const n = name.toLowerCase()
  const color = descriptor.color || '#6ea8ff'

  // For compound objects (car, solar system, etc.) spawn multiple parts
  if (/car|vehicle|truck|bus/.test(n)) {
    return [
      { id: `obj_body_${Date.now()}`,   name: 'car body',   color: color,     position: [0, 0, 0],    renderer: 'box', description: 'The main chassis and body of the vehicle', spin: false },
      { id: `obj_engine_${Date.now()}`, name: 'engine',     color: '#888888', position: [-0.6, 0.2, 0], renderer: 'cylinder', description: 'Internal combustion engine powering the vehicle', spin: false },
      { id: `obj_wheel1_${Date.now()}`, name: 'front wheel',color: '#333333', position: [0.9, -0.5, 0.6], renderer: 'torus', description: 'Front right wheel and tire assembly', spin: true },
      { id: `obj_wheel2_${Date.now()}`, name: 'rear wheel', color: '#333333', position: [-0.9, -0.5, 0.6], renderer: 'torus', description: 'Rear right wheel and tire assembly', spin: true },
    ]
  }
  if (/solar.?system/.test(n)) {
    return [
      { id: `obj_sun_${Date.now()}`,     name: 'Sun',     color: '#ffcc00', position: [0, 0, 0],    renderer: 'sphere', description: 'The star at the center of our solar system', spin: false, breathe: true },
      { id: `obj_earth_${Date.now()}`,   name: 'Earth',   color: '#4a9eff', position: [3.5, 0, 0],  renderer: 'sphere', description: 'Our home planet, third from the Sun', spin: true },
      { id: `obj_mars_${Date.now()}`,    name: 'Mars',    color: '#cc5533', position: [5.5, 0, 0],  renderer: 'sphere', description: 'The red planet, fourth from the Sun', spin: true },
      { id: `obj_jupiter_${Date.now()}`, name: 'Jupiter', color: '#d4a96a', position: [-4.5, 0, 0], renderer: 'sphere', description: 'Largest planet in the solar system', spin: true },
    ]
  }
  if (/dna|helix/.test(n)) {
    return [
      { id: `obj_helix_${Date.now()}`,   name: 'DNA double helix', color: color, position: [0, 0, 0], renderer: 'custom', description: 'Double-stranded DNA molecule carrying genetic information', spin: true },
      { id: `obj_base_${Date.now()}`,    name: 'base pairs',       color: '#ff6b6b', position: [0, 0, 0], renderer: 'custom', description: 'Nucleotide base pairs: adenine, thymine, guanine, cytosine', spin: false },
    ]
  }
  if (/brain|neural|neuron/.test(n)) {
    return [
      { id: `obj_cortex_${Date.now()}`,  name: 'cerebral cortex', color: color, position: [0, 0.3, 0], renderer: 'custom', description: 'Outer layer responsible for thought, memory and language', spin: false, breathe: true },
      { id: `obj_neuron_${Date.now()}`,  name: 'neuron cluster',  color: '#a78bfa', position: [0, -0.5, 0], renderer: 'custom', description: 'Network of interconnected nerve cells', spin: true },
    ]
  }
  // Default: single object
  return [
    {
      id: `obj_${Date.now()}`,
      name,
      color,
      position: [0, 0, 0],
      renderer: descriptor.renderer,
      description: descriptor.description,
      spin: descriptor.intent === 'rotate' || descriptor.intent === 'animate',
      breathe: /human|face|organic|heart|brain/.test(n),
      sceneDescriptor: descriptor,
    }
  ]
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const store = useSceneStore()
  const [prompt, setPrompt] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [genError, setGenError] = useState(null)
  const inputRef = useRef(null)

  // ── Generate scene ──────────────────────────────────────────────────────
  const generateScene = useCallback(async (text) => {
    setGenLoading(true)
    setGenError(null)
    try {
      const desc = await groqRoute(text)
      if (!desc.renderer) desc.renderer = 'custom'
      const objs = buildObjects(desc)
      store.loadScene(desc, objs)
      store.addMessage('assistant', `Scene generated: **${desc.object}**. ${desc.description || ''} Click any object to explore it.`)
      setShowChat(true)
    } catch (e) {
      setGenError(e.message)
    }
    setGenLoading(false)
    setPrompt('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [store])

  // ── Select object ───────────────────────────────────────────────────────
  const handleSelect = useCallback((id) => {
    store.selectObject(id)
    const obj = store.objects.find(o => o.id === id)
    if (obj) {
      store.addMessage('assistant', `Selected: **${obj.name}**. You can ask me anything about it, or use the action menu.`)
      setShowChat(true)
    }
  }, [store])

  // ── Context menu action ─────────────────────────────────────────────────
  const handleContextAction = useCallback(async (action, obj) => {
    if (action === 'isolate') {
      store.isolate(obj.id)
      return
    }
    if (action === 'remove') {
      store.removeObject(obj.id)
      store.addMessage('assistant', `Removed **${obj.name}** from the scene.`)
      return
    }
    const actionPrompts = {
      explain:  `Explain what ${obj.name} is, what it does, and why it matters. Be concise and visual.`,
      compare:  `Compare ${obj.name} to something the user might be familiar with. Use an analogy.`,
      modify:   `What modifications can I make to ${obj.name}? List 3-4 specific changes.`,
      simulate: `Simulate what would happen if ${obj.name} was activated or put into motion. Be vivid.`,
    }
    const sysPrompt = `You are AGIS, an interactive visual intelligence assistant. The user is looking at a 3D scene containing: ${store.objects.map(o => o.name).join(', ')}. The currently selected object is: ${obj.name}. Description: ${obj.description || 'none'}. Answer visually and concisely. Max 3 sentences.`
    store.addMessage('user', actionPrompts[action] || action)
    setChatLoading(true)
    setShowChat(true)
    try {
      const res = await groqChat(sysPrompt, [{ role: 'user', content: actionPrompts[action] }])
      store.addMessage('assistant', res.content)
    } catch {
      store.addMessage('assistant', 'Could not get a response. Try again.')
    }
    setChatLoading(false)
  }, [store])

  // ── Chat send ───────────────────────────────────────────────────────────
  const handleChatSend = useCallback(async (text) => {
    // Check for modification commands
    const modCmd = /^(remove|delete|hide) (this|it|the .+)$/i.test(text)
    const scaleCmd = /make (it|this) (larger|bigger|smaller|tiny|huge)/i.exec(text)
    const colorCmd = /change (color|material) to (.+)/i.exec(text)
    const replaceCmd = /replace (this|it) with (.+)/i.exec(text)

    store.addMessage('user', text)

    if (modCmd && store.selectedObject) {
      store.removeObject(store.selectedId)
      store.addMessage('assistant', `Removed **${store.selectedObject?.name}** from the scene.`)
      return
    }
    if (scaleCmd && store.selectedObject) {
      const bigger = /larger|bigger|huge/.test(scaleCmd[2])
      store.addMessage('assistant', `${bigger ? 'Scaled up' : 'Scaled down'} **${store.selectedObject.name}**.`)
      // TODO: apply scale to mesh via store
    }
    if (replaceCmd && store.selectedObject) {
      const newDesc = await groqRoute(replaceCmd[2])
      store.modifyObject(store.selectedId, {
        name: newDesc.object,
        color: newDesc.color,
        renderer: newDesc.renderer,
        description: newDesc.description,
      })
      store.addMessage('assistant', `Replaced **${store.selectedObject?.name}** with **${newDesc.object}**.`)
      return
    }

    // Context-aware chat
    const sceneContext = store.objects.length
      ? `Scene: ${store.objects.map(o => o.name).join(', ')}. Camera at position [${store.camera.pos.map(v => v.toFixed(1)).join(', ')}].`
      : 'No scene active yet.'
    const selectedContext = store.selectedObject
      ? `Selected object: ${store.selectedObject.name}. ${store.selectedObject.description || ''}`
      : 'No object selected.'
    const sysPrompt = `You are AGIS, an interactive visual intelligence assistant embedded in a 3D scene explorer. ${sceneContext} ${selectedContext} Answer questions about the selected object or scene. Be concise and specific. Max 3 sentences. If no object is selected and the user asks about a visual thing, remind them to click an object first.`

    const msgs = store.chatHistory
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }))
    msgs.push({ role: 'user', content: text })

    setChatLoading(true)
    try {
      const res = await groqChat(sysPrompt, msgs)
      store.addMessage('assistant', res.content)
    } catch {
      store.addMessage('assistant', 'Network error. Please try again.')
    }
    setChatLoading(false)
  }, [store])

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const t = prompt.trim()
    if (!t || genLoading) return
    generateScene(t)
  }

  const hasScene = store.objects.length > 0

  return (
    <div className="app-shell">
      {/* ── 3D Canvas ── */}
      <div className="canvas-wrap">
        <Scene
          objects={store.objects}
          selectedId={store.selectedId}
          isolateMode={store.isolateMode}
          onSelect={handleSelect}
          onDeselect={store.deselectAll}
          onCameraChange={store.updateCamera}
        />
      </div>
      <div className="vignette" />

      {/* ── Top bar ── */}
      <div className="statusbar">
        <div className="brand">
          <span className="logo">AGIS</span>
          <span className="ver">v3.0</span>
        </div>
        <div className="status-center">
          {hasScene && (
            <span className="scene-label">
              {store.scene?.object}
              {store.objects.length > 1 && <span className="obj-count">{store.objects.length} objects</span>}
            </span>
          )}
        </div>
        <div className={`status-pill${hasScene ? ' active' : ''}${genLoading ? ' loading' : ''}`}>
          <span className="dot" />
          <span>
            {genLoading ? 'generating…'
              : store.selectedObject ? `↖ ${store.selectedObject.name}`
              : hasScene ? 'click any object'
              : 'awaiting input'}
          </span>
        </div>
      </div>

      {/* ── Groq badge ── */}
      <div className="grok-badge">⚡ <b>Groq</b> LLaMA 3.3 · interactive</div>

      {/* ── Isolate mode banner ── */}
      {store.isolateMode && (
        <div className="isolate-banner">
          🎯 Isolate mode — <b>{store.selectedObject?.name}</b>
          <button onClick={store.exitIsolate}>Exit isolate</button>
        </div>
      )}

      {/* ── Controls hint ── */}
      {hasScene && !store.selectedObject && !genLoading && (
        <div className="controls-hint">
          <span>🖱 scroll to zoom · drag to rotate · right-drag to pan · <b>click any object</b></span>
        </div>
      )}

      {/* ── Empty state ── */}
      {!hasScene && !genLoading && (
        <div className="hint">
          <h1 className="big">Visual <b>Explorer</b></h1>
          <p className="sub">Generate anything — then <i>explore</i> it interactively</p>
          <p className="example-grid">
            {['a car', 'DNA helix', 'solar system', 'dragon', 'black hole', 'human brain'].map(ex => (
              <button key={ex} className="ex-chip" onClick={() => { setPrompt(ex); generateScene(ex) }}>{ex}</button>
            ))}
          </p>
        </div>
      )}

      {/* ── Loading overlay ── */}
      {genLoading && (
        <div className="loading-overlay">
          <div className="loading-ring" />
          <p className="loading-text">Groq generating scene<span className="dots">…</span></p>
          <p className="loading-sub">building objects · assigning metadata</p>
        </div>
      )}

      {/* ── Context menu ── */}
      {store.selectedObject && (
        <ContextMenu
          object={store.selectedObject}
          onAction={handleContextAction}
          onClose={store.deselectAll}
        />
      )}

      {/* ── Chat panel toggle ── */}
      {hasScene && (
        <button className="chat-toggle" onClick={() => setShowChat(s => !s)}>
          {showChat ? '✕ Chat' : '⬡ Chat'}
          {store.chatHistory.filter(m => m.role === 'assistant').length > 0 && (
            <span className="chat-badge">{store.chatHistory.filter(m => m.role === 'assistant').length}</span>
          )}
        </button>
      )}

      {/* ── Chat panel ── */}
      {showChat && (
        <ChatPanel
          selectedObject={store.selectedObject}
          scene={store.scene}
          camera={store.camera}
          messages={store.chatHistory}
          onSend={handleChatSend}
          loading={chatLoading}
        />
      )}

      {/* ── Error toast ── */}
      {genError && <div className="toast show">{genError}</div>}

      {/* ── Bottom prompt bar ── */}
      <div className="dock" onClick={() => inputRef.current?.focus()}>
        <form className="dock-inner" onSubmit={handleFormSubmit}>
          <span className="prompt">›</span>
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={hasScene ? `add or replace: e.g. "add a moon"` : 'generate anything: "a car", "DNA helix", "solar system"…'}
            disabled={genLoading}
            autoComplete="off" spellCheck="false"
            aria-label="AGIS prompt input"
          />
          <button className="send-btn" type="submit" disabled={!prompt.trim() || genLoading}>
            {genLoading ? '…' : 'Generate'}
          </button>
        </form>
      </div>
    </div>
  )
}
