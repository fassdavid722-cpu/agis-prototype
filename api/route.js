// api/route.js — AGIS Groq LLM Router + DuckDuckGo Web Search
export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are AGIS — an AI visual routing engine for a Three.js 3D renderer.
Given any natural language prompt (and optional web search results), return a JSON scene descriptor.

Return ONLY valid JSON — no markdown, no code blocks. Just raw JSON.

{
  "intent": "show" | "rotate" | "zoom" | "explode" | "animate" | "hide" | "change",
  "object": string,
  "renderer": "cube" | "sphere" | "torus" | "cone" | "cylinder" | "octahedron" | "star" | "plane" | "environment" | "custom",
  "camera_action": "auto" | "orbit" | "zoom_in" | "zoom_out" | "top_down" | "front" | "side" | "flythrough",
  "color": "#hexcolor",
  "description": "1-2 sentence description of what will render",
  "code_hint": "brief Three.js approach",
  "search_used": boolean,
  "web_context": string | null
}

Renderer rules:
- Simple shapes → exact name (cube, sphere, torus, cone, cylinder, octahedron, star, plane)
- forest/ocean/space/city/galaxy/mountain/terrain → "environment"  
- human face, animal, vehicle, complex organic, architecture → "custom"
- When unsure → pick closest shape

Color: vivid semantic hex (sky=#87ceeb, fire=#ff4500, nature=#58c87a, water=#5898ff, gold=#ffd700, space=#1a0a2e, crystal=#d4a8ff)`

async function webSearch(query) {
  try {
    // Use DuckDuckGo instant answers API (free, no key)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    const res = await fetch(url, { headers: { 'User-Agent': 'AGIS-Translator/2.0' } })
    const data = await res.json()
    const abstract = data.AbstractText || data.Answer || data.Definition || ''
    if (abstract) return abstract.slice(0, 300)
    // Try related topics
    const related = data.RelatedTopics?.[0]?.Text || ''
    return related.slice(0, 200) || null
  } catch {
    return null
  }
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body
  try { body = await req.json() } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }) }

  const { prompt } = body
  if (!prompt) return new Response(JSON.stringify({ error: 'No prompt' }), { status: 400 })

  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) return new Response(JSON.stringify({ error: 'No API key configured' }), { status: 500 })

  // Step 1: Web search for context
  const searchContext = await webSearch(prompt)

  // Step 2: Call Groq LLM
  try {
    const userContent = searchContext
      ? `Prompt: "${prompt}"\n\nWeb search context: ${searchContext}`
      : `Prompt: "${prompt}"`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ],
        temperature: 0.25,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      throw new Error(`Groq ${groqRes.status}: ${errText}`)
    }

    const data = await groqRes.json()
    const content = data.choices?.[0]?.message?.content || '{}'

    let parsed
    try { parsed = JSON.parse(content) }
    catch {
      const m = content.match(/\{[\s\S]*\}/)
      parsed = m ? JSON.parse(m[0]) : {}
    }

    // Enrich
    parsed.raw = prompt
    parsed.llm = true
    parsed.model = 'llama-3.3-70b'
    parsed.search_used = !!searchContext
    parsed.web_context = searchContext || null
    if (!parsed.color) parsed.color = '#6ea8ff'
    if (!parsed.intent) parsed.intent = 'show'
    if (!parsed.camera_action) parsed.camera_action = 'auto'

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    return new Response(JSON.stringify({
      error: 'llm_error', message: err.message, raw: prompt,
    }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}
