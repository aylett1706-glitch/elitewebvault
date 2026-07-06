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

async function normalizePerformerImages(item) {
  const portrait = await getWorkingImageUrl(item?.portrait_url, item?.cover_url);
  const cover = await getWorkingImageUrl(item?.cover_url, item?.portrait_url);
  return {
    ...item,
    portrait_url: portrait,
    cover_url: cover || portrait
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { query, performer, page } = await req.json();

    const cleanQuery = String(query || '').trim();
    const cleanPerformer = String(performer || '').trim();
    const cleanPage = Math.max(1, parseInt(page) || 1);

    if (containsProhibitedTerm(`${cleanQuery} ${cleanPerformer}`)) {
      return Response.json({
        blocked: true,
        performers: [],
        videos: [],
        message: 'Blocked: searches involving minors, children, teens, or underage themes are permanently prohibited.'
      });
    }

    const isDetail = !!cleanPerformer;
    const prompt = isDetail ? `Search the live web for public, legal, consenting 18+ adult performer profile information for: ${cleanPerformer}.

Rules:
- ONLY include consenting adult performers aged 18+.
- Exclude anything involving minors, children, teens, underage, youthful implication, school-age themes, age ambiguity, coercion, abuse, trafficking, non-consent, incest, bestiality, or violence.
- Never include results with words such as minor, child, kid, teen, schoolgirl, schoolboy, underage, barely legal, or jailbait.
- Use catalogue-style text only, not explicit descriptions.
- Include real direct HTTPS image URLs for portrait_url and cover_url from public adult-site profile thumbnails, Wikimedia, IMDb image CDN, official creator profile images, or verified public social profile images.
- Do not return image search result pages, gallery pages, placeholders, or website logos.
- Prefer image URLs with jpg, jpeg, png, or webp extensions and avoid URLs that block embedding.
- Include a filmography-style list of up to 24 real public adult watch pages featuring this performer.
- For each video include poster_url whenever available; poster_url should be a real thumbnail/frame preview from the video page, not a generic poster or logo.
- If unsure all content is legal consenting adult 18+, exclude it.

Return the performer profile and videos for page ${cleanPage}. For page numbers above 1, return different videos.` : `Search the live web for well-known public legal adult actresses/performers aged 18+.

Rules:
- ONLY include consenting adult performers aged 18+.
- Exclude anything involving minors, children, teens, underage, youthful implication, school-age themes, age ambiguity, coercion, abuse, trafficking, non-consent, incest, bestiality, or violence.
- Never include results with words such as minor, child, kid, teen, schoolgirl, schoolboy, underage, barely legal, or jailbait.
- Use catalogue-style biographies only, not explicit descriptions.
- Include real direct HTTPS image URLs for portrait_url and cover_url from public adult-site profile thumbnails, Wikimedia, IMDb image CDN, official creator profile images, or verified public social profile images.
- Do not return image search result pages, gallery pages, placeholders, or website logos.
- Prefer image URLs with jpg, jpeg, png, or webp extensions and avoid URLs that block embedding.
- Include adult performers, subscription creators, and OnlyFans-style creators with public official profiles.
- Prioritise recognisable adult actresses and creator-led performers with public official profile pages.
- If unsure the performer is clearly adult 18+, exclude them.

Search query: ${cleanQuery || 'popular adult actresses performers'}
Page number: ${cleanPage}
Return up to 18 performer cards. For page numbers above 1, return different performers.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          performer: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              bio: { type: 'string' },
              portrait_url: { type: 'string' },
              cover_url: { type: 'string' },
              profile_url: { type: 'string' },
              categories: { type: 'array', items: { type: 'string' } }
            }
          },
          performers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                bio: { type: 'string' },
                portrait_url: { type: 'string' },
                cover_url: { type: 'string' },
                profile_url: { type: 'string' },
                categories: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          videos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                synopsis: { type: 'string' },
                year: { type: 'number' },
                poster_url: { type: 'string' },
                source_url: { type: 'string' },
                video_url: { type: 'string' },
                categories: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    const rawPerformers = (Array.isArray(result?.performers) ? result.performers : [])
      .filter(item => isSafeText([item?.name, item?.bio, ...(item?.categories || [])]));
    const performers = await Promise.all(rawPerformers.map(normalizePerformerImages));
    const videos = (Array.isArray(result?.videos) ? result.videos : [])
      .filter(item => isSafeText([item?.title, item?.synopsis, ...(item?.categories || [])]));
    const performerProfile = result?.performer && isSafeText([
      result.performer.name,
      result.performer.bio,
      ...(result.performer.categories || [])
    ]) ? await normalizePerformerImages(result.performer) : null;

    return Response.json({
      performer: performerProfile,
      performers,
      videos,
      page: cleanPage,
      has_more: isDetail ? videos.length > 0 : performers.length > 0
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
