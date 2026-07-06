// Replaced Base44 SDK with Supabase auth + Ollama + Supabase REST DB operations

const PROHIBITED_TERMS = [
  'minor', 'minors', 'child', 'children', 'kid', 'kids', 'underage', 'under age',
  'teen', 'teens', 'teenager', 'teenagers', 'schoolgirl', 'schoolboy', 'young girl',
  'young boy', 'little girl', 'little boy', 'loli', 'lolita', 'preteen', 'pre-teen',
  'barely legal', 'jailbait', 'infant', 'baby', 'babies', 'toddler'
];

const containsProhibitedTerm = (value) => {
  const text = String(value || '').toLowerCase();
  return PROHIBITED_TERMS.some(term => text.includes(term));
};

const isSafeText = (parts) => !containsProhibitedTerm(parts.filter(Boolean).join(' '));

const hasImageExtension = (url) => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(String(url || ''));

async function getWorkingImageUrl(...urls) {
  for (const rawUrl of urls) {
    const url = String(rawUrl || '').trim();
    if (url.startsWith('https://')) return url;
  }
  return '';
}

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || '';

    const getUserFromHeader = async (headers) => {
      try {
        const auth = headers.get('authorization') || '';
        if (!auth) return null;
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: auth, apikey: SUPABASE_SERVICE_ROLE_KEY } });
        if (!resp.ok) return null;
        return await resp.json();
      } catch (e) { return null }
    };

    const invokeLLM = async (opts = {}) => {
      if (!OLLAMA_URL) throw new Error('OLLAMA_URL not configured');
      const body = { model: opts.model || 'llama2', messages: [{ role: 'user', content: opts.prompt }], max_tokens: opts.max_tokens || 2000 };
      const res = await fetch(`${OLLAMA_URL}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      return res.json();
    };

    const supabaseFilter = async (table, match = {}) => {
      const params = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(String(v))}`).join('&');
      const url = `${SUPABASE_URL}/rest/v1/${table}${params ? `?${params}` : '?select=*'}`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY } });
      if (!resp.ok) return [];
      return await resp.json();
    };

    const supabaseInsert = async (table, obj) => {
      const url = `${SUPABASE_URL}/rest/v1/${table}`;
      const resp = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify([obj]) });
      if (!resp.ok) throw new Error('Supabase insert failed');
      return await resp.json();
    };

    const supabaseUpdateById = async (table, id, obj) => {
      const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`;
      const resp = await fetch(url, { method: 'PATCH', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(obj) });
      if (!resp.ok) throw new Error('Supabase update failed');
      return await resp.json();
    };

    const user = await getUserFromHeader(req.headers);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query } = await req.json();
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) return Response.json({ error: 'Enter a performer name or profile URL.' }, { status: 400 });

    if (containsProhibitedTerm(cleanQuery)) {
      return Response.json({ error: 'Blocked: underage or age-ambiguous searches are prohibited.' }, { status: 400 });
    }

    const raw = await invokeLLM({ model: 'ollama', add_context_from_internet: true, prompt: `Research this public adult performer or official profile URL: ${cleanQuery}

Return clean structured data for a private catalogue.
Rules:
- Only include legal consenting adult performers aged 18+.
- Exclude anything involving minors, teens, underage, school-age themes, age ambiguity, coercion, non-consent, trafficking, abuse, incest, bestiality, or violence.
- Use professional catalogue-style language only.
- Prefer high-quality 4K/8K/HDR video examples when available.
- photo_url and cover_url must be real direct HTTPS image files that load in a browser img tag.
- video_examples should be real public watch pages or direct playable URLs, with poster or GIF preview when available.
- Do not invent fake URLs.

Return one performer profile and up to 12 high-quality video examples.`, 
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          stage_name: { type: 'string' },
          photo_url: { type: 'string' },
          cover_url: { type: 'string' },
          bio: { type: 'string' },
          birth_date: { type: 'string' },
          height: { type: 'string' },
          measurements: { type: 'string' },
          nationality: { type: 'string' },
          hair_color: { type: 'string' },
          eye_color: { type: 'string' },
          gender: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          social_links: { type: 'object' },
          video_examples: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                source_url: { type: 'string' },
                video_url: { type: 'string' },
                poster_url: { type: 'string' },
                preview_gif_url: { type: 'string' },
                quality: { type: 'string' }
              }
            }
          }
        }
      }
    });

    let result = {};
    try {
      if (raw?.choices && raw.choices[0]?.message?.content) result = JSON.parse(raw.choices[0].message.content);
      else result = raw;
    } catch (e) { result = raw || {} }

    if (!isSafeText([result?.name, result?.stage_name, result?.bio, ...(result?.tags || [])])) {
      return Response.json({ error: 'Blocked: unsafe or age-ambiguous result.' }, { status: 400 });
    }

    const photoUrl = await getWorkingImageUrl(result?.photo_url, result?.cover_url);
    const coverUrl = await getWorkingImageUrl(result?.cover_url, result?.photo_url);
    const videos = (result?.video_examples || []).filter(video => isSafeText([video?.title, video?.quality]));

    const existing = await supabaseFilter('Performer', { name: result?.name || result?.stage_name || cleanQuery });
    const payload = {
      name: result?.name || result?.stage_name || cleanQuery,
      stage_name: result?.stage_name || result?.name || cleanQuery,
      photo_url: photoUrl,
      cover_url: coverUrl || photoUrl,
      bio: result?.bio || '',
      birth_date: result?.birth_date || '',
      height: result?.height || '',
      measurements: result?.measurements || '',
      nationality: result?.nationality || '',
      hair_color: result?.hair_color || '',
      eye_color: result?.eye_color || '',
      gender: result?.gender || 'Female',
      total_scenes: videos.length,
      tags: result?.tags || [],
      social_links: result?.social_links || {},
      video_examples: videos
    };

    const performer = existing?.[0]?.id
      ? await supabaseUpdateById('Performer', existing[0].id, payload)
      : await supabaseInsert('Performer', payload);

    return Response.json({ performer });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
