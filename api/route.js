// api/route.js — Vercel Edge Function: AGIS Grok LLM Router with Web Search
// POST { prompt: string } → { intent, object, renderer, camera_action, color, code, search_used, web_context }

export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are AGIS — an AI visual routing engine. 
Given a natural language prompt, you do two things:
1. Search the web if needed to understand what the user wants to visualize
2. Return a structured JSON scene descriptor for a Three.js renderer

You MUST always return valid JSON with this exact schema:
{
  "intent": "show" | "rotate" | "zoom" | "explode" | "animate" | "hide" | "change",
  "object": string (short name of the object, e.g. "human face", "DNA helix", "solar system"),
  "renderer": "cube" | "sphere" | "torus" | "cone" | "cylinder" | "octahedron" | "star" | "plane" | "environment" | "custom",
  "camera_action": "auto" | "orbit" | "zoom_in" | "zoom_out" | "top_down" | "front" | "side" | "flythrough",
  "color": "#hexcolor",
  "description": string (1-2 sentence description of what will be rendered),
  "code_hint": string (brief Three.js approach, e.g. "Use SphereGeometry with MeshStandardMaterial, add PointLight"),
  "search_used": boolean,
  "web_context": string | null (any relevant fact found via search, null if not searched)
}

Renderer selection rules:
- Simple shapes → use their exact name (cube, sphere, torus, cone, cylinder, octahedron, star, plane)
- Scenes/environments → "environment" 
- Complex/organic objects (human face, animal, vehicle, etc.) → "custom" with detailed code_hint
- When unsure → pick the closest shape renderer

Color rules:
- Pick a color that matches the object semantically (sky = #87ceeb, fire = #ff4500, nature = #58c87a, etc.)
- Use vivid, saturated colors that look good on a dark background

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks.`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { prompt } = await req.json()
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'No prompt provided' }), { status: 400 })
  }

  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key configured' }), { status: 500 })
  }

  try {
    // Call Grok with live_search tool enabled
    const body = {
      model: 'grok-3-latest',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Visualize: "${prompt}"` }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'web_search',
            description: 'Search the web for information to help visualize the object accurately',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' }
              },
              required: ['query']
            }
          }
        }
      ],
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 600,
    }

    const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!grokRes.ok) {
      const errText = await grokRes.text()
      throw new Error(`Grok API error ${grokRes.status}: ${errText}`)
    }

    const grokData = await grokRes.json()
    const choice = grokData.choices?.[0]
    const content = choice?.message?.content || ''

    // Parse the JSON response
    let parsed
    try {
      // Strip any accidental markdown wrapping
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      // Fallback: extract JSON from content
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0])
      } else {
        throw new Error('Could not parse Grok response as JSON')
      }
    }

    // Ensure required fields exist
    parsed.raw = prompt
    parsed.llm = true
    if (!parsed.color) parsed.color = '#6ea8ff'
    if (!parsed.intent) parsed.intent = 'show'
    if (!parsed.camera_action) parsed.camera_action = 'auto'

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({
      error: 'llm_error',
      message: err.message,
      raw: prompt,
    }), { status: 500 })
  }
}
