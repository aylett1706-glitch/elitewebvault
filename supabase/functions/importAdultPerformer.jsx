import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query } = await req.json();
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) return Response.json({ error: 'Enter a performer name or profile URL.' }, { status: 400 });

    if (containsProhibitedTerm(cleanQuery)) {
      return Response.json({ error: 'Blocked: underage or age-ambiguous searches are prohibited.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `Research this public adult performer or official profile URL: ${cleanQuery}

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

    if (!isSafeText([result?.name, result?.stage_name, result?.bio, ...(result?.tags || [])])) {
      return Response.json({ error: 'Blocked: unsafe or age-ambiguous result.' }, { status: 400 });
    }

    const photoUrl = await getWorkingImageUrl(result?.photo_url, result?.cover_url);
    const coverUrl = await getWorkingImageUrl(result?.cover_url, result?.photo_url);
    const videos = (result?.video_examples || []).filter(video => isSafeText([video?.title, video?.quality]));

    const existing = await base44.entities.Performer.filter({ name: result?.name || result?.stage_name || cleanQuery }, '-updated_date', 1);
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
      ? await base44.entities.Performer.update(existing[0].id, payload)
      : await base44.entities.Performer.create(payload);

    return Response.json({ performer });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
