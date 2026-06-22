// grokRouter.js — AGIS LLM Router via xAI Grok + Web Search
// Calls the backend /api/route endpoint which holds the API key securely

export async function grokRoute(prompt) {
  try {
    const res = await fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data
  } catch (err) {
    return {
      error: 'llm_error',
      message: err.message,
      intent: 'show',
      object: null,
      renderer: null,
      camera_action: 'auto',
      raw: prompt,
    }
  }
}
