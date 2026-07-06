import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORIES = [
  'Trending', 'Featured', 'New Releases', 'Most Viewed', 'Amateur', 'Professional', 'Couples',
  'Solo', 'Lesbian', 'Gay', 'Trans', 'MILF', 'Interracial', 'POV', 'VR', 'HD', '4K',
  'Romantic', 'Massage', 'Fitness', 'Cosplay', 'Blonde', 'Brunette', 'Redhead', 'Ebony',
  'Latina', 'Asian', 'European', 'BBW', 'Mature', 'BDSM', 'Fetish', 'Public', 'Outdoor',
  'Compilation', 'Reality', 'Verified', 'Premium', 'Elite Picks'
];

const TARGET_SITES = [
  'xhamster.com', 'xnxx.com', 'xvideos.com', 'redtube.com', 'youporn.com', 'pornhub.com',
  'spankbang.com', 'tube8.com', 'tnaflix.com', 'eporner.com', 'beeg.com',
  'motherless.com', 'drtuber.com', 'nuvid.com', 'sunporno.com', 'pornone.com'
];

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

const isSafeAdultResult = (item) => {
  const searchable = [
    item?.title,
    item?.synopsis,
    item?.category,
    item?.preview_gif_url,
    item?.gif_url,
    ...(Array.isArray(item?.categories) ? item.categories : [])
  ].join(' ');

  return !containsProhibitedTerm(searchable);
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, category, page, fast } = await req.json();

    const cleanQuery = String(query || '').trim();
    const cleanCategory = String(category || '').trim();
    const cleanPage = Math.max(1, parseInt(page) || 1);

    if (!cleanQuery && !cleanCategory) {
      return Response.json({ results: [] });
    }

    if (containsProhibitedTerm(`${cleanQuery} ${cleanCategory}`)) {
      return Response.json({
        blocked: true,
        results: [],
        message: 'Blocked: searches involving minors, children, teens, or underage themes are permanently prohibited.'
      });
    }

    const siteQuery = TARGET_SITES.map(site => `site:${site}`).join(' OR ');

    const prompt = `Search the live web for real playable legal adult video pages and embed URLs for viewers aged 18+ only.

Rules:
- ONLY return legal, consenting adult content involving adults aged 18+.
- Permanently block and exclude anything involving minors, children, teens, underage, school-age themes, youthful implication, or age ambiguity.
- Do not include illegal, non-consensual, exploitative, underage, incest, bestiality, trafficking, abusive, coerced, or violent content.
- Never return results with words such as minor, child, kid, teen, schoolgirl, schoolboy, underage, barely legal, or jailbait.
- Return real video pages from popular adult tube sites only; do not invent fake URLs.
- Prioritise xhamster.com, xnxx.com, xvideos.com, redtube.com, youporn.com, pornhub.com, spankbang.com, tube8.com, tnaflix.com, eporner.com, beeg.com, drtuber.com, nuvid.com, and similar popular adult websites.
- For each result, include a source_url that is a real public watch page.
- Include video_url only when a real public embed URL is available from the same site; otherwise use the source_url as video_url.
- Include preview_gif_url as a real animated GIF/WebP preview from the actual video whenever available, ideally a 3-second snippet.
- Include poster_url as a real thumbnail/frame preview from the actual video whenever available, so the cover looks like a video snippet rather than a generic image.
- Return useful catalogue-style metadata only, not explicit descriptions.
- If you are unsure every performer is clearly adult 18+, exclude it.

Search query: ${cleanQuery || `${cleanCategory} adult videos` || 'adult videos'}
Category: ${cleanCategory || 'Any'}
Page number: ${cleanPage}
Target sites query: ${siteQuery}
Allowed category suggestions: ${CATEGORIES.join(', ')}

Return up to ${fast ? 8 : 24} real playable results from popular sites. Prioritise results with direct poster_url thumbnails. For page numbers above 1, return different results than earlier pages.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                synopsis: { type: 'string' },
                category: { type: 'string' },
                categories: { type: 'array', items: { type: 'string' } },
                source_url: { type: 'string' },
                video_url: { type: 'string' },
                poster_url: { type: 'string' },
                preview_gif_url: { type: 'string' },
                gif_url: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const results = Array.isArray(result?.results) ? result.results : [];
    const safeResults = results.filter(isSafeAdultResult);
    return Response.json({ results: safeResults, page: cleanPage, has_more: safeResults.length > 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
