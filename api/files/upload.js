export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { fileName, contentType, data } = req.body || {}
    if (!fileName || !data) return res.status(400).json({ error: 'Missing fileName or data' })

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_STORAGE_BUCKET) return res.status(500).json({ error: 'Supabase storage not configured' })

    const path = `imports/${Date.now()}-${fileName}`
    const buffer = Buffer.from(data, 'base64')
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodeURIComponent(path)}`
    const uploadResp = await fetch(uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': contentType }, body: buffer })
    if (!uploadResp.ok) {
      const text = await uploadResp.text()
      return res.status(500).json({ error: 'Upload failed', detail: text })
    }
    const publicUrl = `${SUPABASE_URL.replace(/\.supabase\.co$/, '.supabase.co')}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${encodeURIComponent(path)}`
    return res.status(200).json({ file_url: publicUrl })
  } catch (err) {
    console.error('upload error', err)
    return res.status(500).json({ error: String(err) })
  }
}
