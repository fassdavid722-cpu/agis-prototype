// ContextMenu.jsx — AGIS v3.0 — Object context menu
import React from 'react'

export default function ContextMenu({ object, onAction, onClose }) {
  if (!object) return null

  const actions = [
    { id: 'explain',  icon: '🔍', label: 'Explain' },
    { id: 'compare',  icon: '⚖️', label: 'Compare' },
    { id: 'modify',   icon: '✏️', label: 'Modify' },
    { id: 'simulate', icon: '⚡', label: 'Simulate' },
    { id: 'isolate',  icon: '🎯', label: 'Isolate' },
    { id: 'remove',   icon: '🗑️', label: 'Remove' },
  ]

  return (
    <div className="ctx-menu">
      <div className="ctx-header">
        <span className="ctx-name">{object.name}</span>
        <span className="ctx-id">#{object.id.slice(-4)}</span>
        <button className="ctx-close" onClick={onClose}>✕</button>
      </div>
      <div className="ctx-actions">
        {actions.map(a => (
          <button key={a.id} className="ctx-btn" onClick={() => onAction(a.id, object)}>
            <span className="ctx-icon">{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
      <div className="ctx-meta">
        <div className="ctx-meta-row"><span>renderer</span><span>{object.renderer || 'custom'}</span></div>
        <div className="ctx-meta-row"><span>color</span>
          <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background: object.color, marginRight:5, verticalAlign:'middle' }} />{object.color}</span>
        </div>
        {object.description && <div className="ctx-desc">{object.description}</div>}
      </div>
    </div>
  )
}
