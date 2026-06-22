// App.jsx — AGIS v4.0 — Interactive Visual Intelligence Workspace
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
  const color = descriptor.color || '#a78bfa'

  if (/\bcar\b|vehicle|truck|sedan|suv/.test(n)) {
    return [{ id:`obj_car_${Date.now()}`, name:'car', color, position:[0,0.2,0], description:'A motor vehicle with four wheels' }]
  }
  if (/solar.?system/.test(n)) {
    return [{ id:`obj_ss_${Date.now()}`, name:'solar system', color:'#ffcc00', position:[0,0,0], description:'Our solar system with orbiting planets' }]
  }
  if (/dna|helix/.test(n)) {
    return [{ id:`obj_dna_${Date.now()}`, name:'dna helix', color, position:[0,0,0], description:'DNA double helix carrying genetic information' }]
  }
  if (/brain|neural|neuron/.test(n)) {
    return [{ id:`obj_brain_${Date.now()}`, name:'brain', color:'#e87ca0', position:[0,0,0], description:'The human brain — seat of consciousness' }]
  }
  if (/black.?hole/.test(n)) {
    return [{ id:`obj_bh_${Date.now()}`, name:'black hole', color:'#ff6600', position:[0,0,0], description:'A region of spacetime where gravity is so strong nothing can escape' }]
  }
  if (/human|person|man|woman|figure/.test(n)) {
    return [{ id:`obj_human_${Date.now()}`, name:'human', color:'#f0c090', position:[0,0,0], description:'A human figure' }]
  }
  if (/robot|android|cyborg|mech/.test(n)) {
    return [{ id:`obj_robot_${Date.now()}`, name:'robot', color:'#4488cc', position:[0,0,0], description:'A humanoid robot' }]
  }
  if (/dragon/.test(n)) {
    return [{ id:`obj_dragon_${Date.now()}`, name:'dragon', color, position:[0,0,0], description:'A fearsome winged dragon' }]
  }
  if (/tree|forest|plant/.test(n)) {
    return [{ id:`obj_tree_${Date.now()}`, name:'tree', color:'#2d8c2d', position:[0,0,0], description:'A tall tree with layered canopy' }]
  }
  if (/planet|earth|mars|saturn|jupiter|moon/.test(n)) {
    return [{ id:`obj_planet_${Date.now()}`, name, color, position:[0,0,0], description:`The planet ${name}` }]
  }
  if (/sword|blade|katana/.test(n)) {
    return [{ id:`obj_sword_${Date.now()}`, name:'sword', color:'#aaddff', position:[0,0,0], description:'A sharp sword with decorated handle' }]
  }
  if (/atom|molecule|electron/.test(n)) {
    return [{ id:`obj_atom_${Date.now()}`, name:'atom', color, position:[0,0,0], description:'An atom with orbiting electrons' }]
  }
  if (/building|skyscraper|tower|eiffel/.test(n)) {
    return [{ id:`obj_bld_${Date.now()}`, name:'building', color, position:[0,0,0], description:'A tall urban building' }]
  }
  // Default
  return [{ id:`obj_${Date.now()}`, name, color, position:[0,0,0], description: descriptor.description || name, sceneDescriptor: descriptor }]
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
          <span className="ver">v4.0</span>
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
