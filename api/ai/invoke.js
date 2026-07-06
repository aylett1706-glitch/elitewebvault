/* Vercel Serverless function: AI invoke proxy
   Supports multiple provider adapters via environment variables:
   - OLLAMA_URL (e.g. http://localhost:11434) for Ollama local server
   - HUGGINGFACE_API_KEY for Hugging Face Inference API
   - SEARXNG_URL for SearxNG search proxy

   Request JSON: { provider: 'ollama'|'huggingface'|'searxng'|..., payload: {...} }
*/

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { provider, payload } = req.body || {}

  try {
    if (provider === 'ollama') {
      const url = process.env.OLLAMA_URL
      if (!url) return res.status(500).json({ error: 'OLLAMA_URL not configured' })
      const resp = await fetch(`${url}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      })
      const json = await resp.json()
      return res.status(200).json(json)
    }

    if (provider === 'huggingface') {
      const key = process.env.HUGGINGFACE_API_KEY
      if (!key) return res.status(500).json({ error: 'HUGGINGFACE_API_KEY not configured' })
      const model = (payload && payload.model) || 'gpt2'
      const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.input ?? payload)
      })
      const json = await resp.json()
      return res.status(200).json(json)
    }

    if (provider === 'searxng') {
      const url = process.env.SEARXNG_URL
      if (!url) return res.status(500).json({ error: 'SEARXNG_URL not configured' })
      const q = encodeURIComponent((payload && payload.q) || payload || '')
      const resp = await fetch(`${url}/search?q=${q}&format=json`)
      const json = await resp.json()
      return res.status(200).json(json)
    }

    // Generic web fetch fallback
    if (provider === 'fetch') {
      const { url, method = 'GET', headers = {}, body } = payload || {}
      if (!url) return res.status(400).json({ error: 'Missing url in payload' })
      const resp = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
      const text = await resp.text()
      return res.status(200).json({ status: resp.status, body: text })
    }

    return res.status(400).json({ error: 'Unknown provider' })
  } catch (err) {
    console.error('AI invoke error', err)
    return res.status(500).json({ error: String(err) })
  }
}
