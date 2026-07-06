// Replaced Base44 SDK with Supabase auth shim

const JIKAN_BASE = 'https://api.jikan.moe/v4';

function normalizeAnime(item) {
  const trailerId = item.trailer?.youtube_id || '';
  const genres = ['Anime', ...(item.genres || []).map(genre => genre.name), ...(item.themes || []).map(theme => theme.name), ...(item.demographics || []).map(demo => demo.name)];
  const studios = (item.studios || []).map(studio => studio.name).filter(Boolean);
  const info = [
    item.status && `Status: ${item.status}`,
    item.episodes && `Episodes: ${item.episodes}`,
    item.duration && `Duration: ${item.duration}`,
    item.rank && `Rank: #${item.rank}`,
    item.popularity && `Popularity: #${item.popularity}`,
    item.members && `Community members: ${item.members.toLocaleString?.() || item.members}`,
    studios.length && `Studio: ${studios.join(', ')}`,
    item.source && `Source: ${item.source}`
  ].filter(Boolean).join(' • ');

  return {
    title: item.title_english || item.title,
    type: item.type === 'Movie' ? 'movie' : 'tv_show',
    synopsis: [item.synopsis || '', info].filter(Boolean).join('\n\n'),
    year: item.year || (item.aired?.from ? Number(item.aired.from.slice(0, 4)) : null),
    rating: item.score || 0,
    imdb_rating: item.score || 0,
    genres: [...new Set(genres.filter(Boolean))],
    cast: [],
    director: studios[0] || '',
    poster_url: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    backdrop_url: item.trailer?.images?.maximum_image_url || item.images?.jpg?.large_image_url || '',
    video_url: '',
    trailer_url: trailerId ? `https://www.youtube.com/watch?v=${trailerId}` : '',
    duration_minutes: item.duration ? parseInt(item.duration, 10) || null : null,
    seasons: null,
    collection_name: item.title,
    collection_key: item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
    related_keywords: [...new Set(['Anime', 'Japanese animation', item.title, item.title_japanese, item.source, ...genres, ...studios].filter(Boolean))],
    source_url: item.url || '',
    content_rating: item.rating || '',
    content_notes: info,
    language: 'ja'
  };
}

function normalizeManga(item) {
  const genres = [...(item.genres || []), ...(item.themes || []), ...(item.demographics || [])].map(genre => genre.name).filter(Boolean);
  const creators = (item.authors || []).map(author => author.name).filter(Boolean);
  const info = [
    item.status && `Status: ${item.status}`,
    item.chapters && `Chapters: ${item.chapters}`,
    item.volumes && `Volumes: ${item.volumes}`,
    item.rank && `Rank: #${item.rank}`,
    item.popularity && `Popularity: #${item.popularity}`,
    item.members && `Community members: ${item.members.toLocaleString?.() || item.members}`,
    item.serializations?.length && `Published in: ${item.serializations.map(serial => serial.name).join(', ')}`
  ].filter(Boolean).join(' • ');

  return {
    title: item.title_english || item.title,
    synopsis: [item.synopsis || '', info].filter(Boolean).join('\n\n'),
    cover_url: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    banner_url: item.images?.jpg?.large_image_url || '',
    author: creators[0] || '',
    artist: creators[0] || '',
    genres: [...new Set(genres)],
    status: item.status?.toLowerCase().includes('finished') ? 'completed' : 'ongoing',
    content_rating: item.rating || '',
    is_featured: false,
    chapters: [],
    views: 0,
    source_url: item.url || '',
    read_url: '',
    read_source_label: ''
  };
}

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const getUserFromHeader = async (headers) => {
      try {
        const auth = headers.get('authorization') || '';
        if (!auth) return null;
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: auth, apikey: SUPABASE_SERVICE_ROLE_KEY } });
        if (!resp.ok) return null;
        return await resp.json();
      } catch (e) {
        return null;
      }
    };

    const user = await getUserFromHeader(req.headers);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query, type = 'anime', deep = false, limit = 12, status = '', rating = '' } = await req.json();
    if (!query) return Response.json({ results: [] });

    const endpoint = type === 'manga' ? 'manga' : 'anime';
    const pageLimit = Math.min(deep ? 24 : limit, 24);
    const searchTerms = deep ? [query, `${query} ${type}`, `${query} recommendations`] : [query];
    const allItems = [];

    for (const term of searchTerms) {
      const params = new URLSearchParams({ q: term, limit: String(pageLimit), sfw: 'true', order_by: 'score', sort: 'desc' });
      if (status) params.set('status', status);
      if (rating && endpoint === 'anime') params.set('rating', rating);
      const res = await fetch(`${JIKAN_BASE}/${endpoint}?${params.toString()}`);
      const data = await res.json();
      allItems.push(...(data.data || []));
      if (!deep) break;
    }

    const seen = new Set();
    const uniqueItems = allItems.filter(item => {
      const key = item.mal_id || item.url || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const results = uniqueItems
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, pageLimit)
      .map(type === 'manga' ? normalizeManga : normalizeAnime);

    return Response.json({ results, deep, count: results.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
