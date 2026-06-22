// ChatPanel.jsx — AGIS v3.0 — Context-aware visual chat
import React, { useState, useRef, useEffect } from 'react'

const QUICK_QUESTIONS = [
  { label: 'What is this?', q: 'What is this?' },
  { label: 'How does it work?', q: 'How does it work?' },
  { label: 'What is it made of?', q: 'What is it made of?' },
  { label: 'Why is it important?', q: 'Why is it important?' },
  { label: 'What if I remove it?', q: 'What happens if I remove this?' },
]

export default function ChatPanel({ selectedObject, scene, camera, messages, onSend, loading }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text) => {
    const t = (text || input).trim()
    if (!t || loading) return
    onSend(t)
    setInput('')
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">⬡ AGIS CHAT</span>
        {selectedObject && (
          <span className="chat-context-pill">
            🎯 {selectedObject.name}
          </span>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            {selectedObject
              ? `Selected: ${selectedObject.name}. Ask me anything about it.`
              : 'Generate a scene, then click any object to ask questions about it.'}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.role === 'assistant' && <span className="chat-avatar">⬡</span>}
            <div className="chat-bubble">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <span className="chat-avatar">⬡</span>
            <div className="chat-bubble typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {selectedObject && messages.length === 0 && (
        <div className="quick-q">
          {QUICK_QUESTIONS.map(qq => (
            <button key={qq.q} className="quick-btn" onClick={() => handleSend(qq.q)}>
              {qq.label}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={selectedObject ? `Ask about ${selectedObject.name}…` : 'Generate a scene first…'}
          disabled={loading}
        />
        <button className="chat-send" onClick={() => handleSend()} disabled={!input.trim() || loading}>
          {loading ? '…' : '↑'}
        </button>
      </div>
    </div>
  )
}
