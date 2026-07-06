const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

function clean(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function buildQueries(mode, query) {
  if (mode === 'walkthrough') {
    const safeQuery = clean(query);
    return [
      `${safeQuery} complete walkthrough full game modern no commentary`,
      `${safeQuery} full game walkthrough all missions`,
      `${safeQuery} complete guide walkthrough gameplay`
    ];
  }

  return [
    'upcoming games 2026 official trailer gameplay',
    'new game trailers 2026 official reveal',
    'upcoming PS5 Xbox PC games official trailer',
    'most anticipated games 2026 gameplay trailer'
  ];
}

async function searchYouTube(apiKey, searchQuery, maxResults) {
  const params = new URLSearchParams({
    part: 'snippet',
    q: searchQuery,
    type: 'video',
    videoEmbeddable: 'true',
    safeSearch: 'moderate',
    order: 'relevance',
    maxResults: String(maxResults),
    key: apiKey
  });

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'YouTube search failed');
  return data.items || [];
}

async function enrichVideos(apiKey, items) {
  const ids = [...new Set(items.map(item => item.id?.videoId).filter(Boolean))];
  if (!ids.length) return [];

  const params = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    id: ids.join(','),
    key: apiKey
  });

  const response = await fetch(`${YOUTUBE_VIDEOS_URL}?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'YouTube video lookup failed');

  return (data.items || []).map(video => ({
    id: video.id,
    title: clean(video.snippet?.title),
    description: clean(video.snippet?.description),
    channel_title: video.snippet?.channelTitle || 'YouTube',
    published_at: video.snippet?.publishedAt,
    thumbnail_url: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
    video_url: `https://www.youtube.com/watch?v=${video.id}`,
    embed_url: `https://www.youtube.com/embed/${video.id}`,
    views: Number(video.statistics?.viewCount || 0),
    duration: video.contentDetails?.duration || ''
  }));
}

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return Response.json({ error: 'YOUTUBE_API_KEY is not configured' }, { status: 500 });

    const { mode = 'trailers', query = '', limit = 12 } = await req.json();
    if (mode === 'walkthrough' && !clean(query)) return Response.json({ results: [] });

    const queries = buildQueries(mode, query);
    const searches = await Promise.all(queries.map(item => searchYouTube(apiKey, item, 8)));
    const merged = searches.flat();
    const videos = await enrichVideos(apiKey, merged);

    const seen = new Set();
    const results = videos
      .filter(video => {
        if (seen.has(video.id)) return false;
        seen.add(video.id);
        return true;
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, Math.min(Math.max(Number(limit) || 12, 4), 24));

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
