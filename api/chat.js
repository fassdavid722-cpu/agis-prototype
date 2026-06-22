// api/chat.js — AGIS v3.0 — Context-aware Groq chat
export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let body
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }

  const { system, messages } = body
  if (!messages?.length) return new Response(JSON.stringify({ error: 'No messages' }), { status: 400 })

  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) return new Response(JSON.stringify({ error: 'No API key' }), { status: 500 })

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system || 'You are AGIS, an interactive visual intelligence assistant. Be concise and helpful.' },
          ...messages,
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    })
    if (!groqRes.ok) throw new Error(`Groq ${groqRes.status}`)
    const data = await groqRes.json()
    const content = data.choices?.[0]?.message?.content || 'No response.'
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
