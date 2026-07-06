import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TMDB_TOKEN = Deno.env.get("TMDB_READ_ACCESS_TOKEN");
const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
const BASE_URL = "https://api.themoviedb.org/3";

const headers = {
  "Authorization": `Bearer ${TMDB_TOKEN}`,
  "Content-Type": "application/json"
};

async function fetchTMDB(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  return res.json();
}

async function isEmbeddableYouTubeVideo(key) {
  if (!YOUTUBE_API_KEY || !key) return true;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${key}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items?.[0]?.status?.embeddable !== false;
}

async function pickOfficialTrailer(videos = []) {
  const trustedChannels = ["imdb", "movieclips", "fandango", "moviefone", "warner bros", "universal pictures", "paramount pictures", "sony pictures", "20th century studios", "marvel entertainment", "disney", "netflix"];
  const candidates = videos
    .filter(v => v.site === "YouTube" && ["Trailer", "Teaser", "Clip"].includes(v.type))
    .sort((a, b) => {
      const aName = `${a.name || ''} ${a.type || ''}`.toLowerCase();
      const bName = `${b.name || ''} ${b.type || ''}`.toLowerCase();
      const trustedScore = Number(trustedChannels.some(channel => bName.includes(channel))) - Number(trustedChannels.some(channel => aName.includes(channel)));
      if (trustedScore) return trustedScore;
      const officialScore = Number(Boolean(b.official)) - Number(Boolean(a.official));
      if (officialScore) return officialScore;
      const trailerScore = Number(b.type === "Trailer") - Number(a.type === "Trailer");
      if (trailerScore) return trailerScore;
      return new Date(b.published_at || 0) - new Date(a.published_at || 0);
    });

  for (const video of candidates) {
    if (await isEmbeddableYouTubeVideo(video.key)) return video;
  }

  return null;
}

function getMovieCertification(releaseDates = []) {
  const countries = ['AU', 'US', 'GB'];
  for (const country of countries) {
    const entry = releaseDates.find(item => item.iso_3166_1 === country);
    const certification = entry?.release_dates?.find(item => item.certification)?.certification;
    if (certification) return { content_rating: certification, age_rating_country: country };
  }
  return { content_rating: '', age_rating_country: '' };
}

function getTvCertification(contentRatings = []) {
  const countries = ['AU', 'US', 'GB'];
  for (const country of countries) {
    const rating = contentRatings.find(item => item.iso_3166_1 === country)?.rating;
    if (rating) return { content_rating: rating, age_rating_country: country };
  }
  return { content_rating: '', age_rating_country: '' };
}

function detectCollection(title = '', detail = {}) {
  const text = `${title} ${detail.name || ''} ${detail.title || ''}`.toLowerCase();
  const rules = [
    ['marvel', 'Marvel'], ['avengers', 'Marvel'], ['spider-man', 'Marvel'], ['spiderman', 'Marvel'], ['x-men', 'Marvel'], ['guardians of the galaxy', 'Marvel'],
    ['dc', 'DC'], ['batman', 'DC'], ['superman', 'DC'], ['wonder woman', 'DC'], ['justice league', 'DC'], ['aquaman', 'DC'], ['joker', 'DC'],
    ['descendants', 'Descendants'], ['star wars', 'Star Wars'], ['harry potter', 'Harry Potter'], ['jurassic', 'Jurassic Park'],
    ['fast', 'Fast & Furious'], ['transformers', 'Transformers'], ['lord of the rings', 'The Lord of the Rings'], ['hobbit', 'The Lord of the Rings'],
    ['minions', 'Despicable Me'], ['despicable me', 'Despicable Me'], ['toy story', 'Toy Story'], ['frozen', 'Frozen'], ['cars', 'Cars']
  ];
  const match = rules.find(([keyword]) => text.includes(keyword));
  const collectionName = detail.belongs_to_collection?.name || match?.[1] || '';
  return {
    collection_name: collectionName,
    collection_key: collectionName ? collectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
    related_keywords: collectionName ? [collectionName] : []
  };
}

function getWatchProviders(detail = {}) {
  const au = detail['watch/providers']?.results?.AU || {};
  const providers = [...(au.flatrate || []), ...(au.ads || []), ...(au.free || [])];
  return [...new Set(providers.map(provider => provider.provider_name).filter(Boolean))];
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { title, type } = await req.json();
  if (!title || !type) return Response.json({ error: "Missing title or type" }, { status: 400 });

  const endpoint = type === 'movie' ? '/search/movie' : '/search/tv';
  const searchRes = await fetchTMDB(`${endpoint}?query=${encodeURIComponent(title)}`);
  
  const item = searchRes.results?.[0];
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  const tmdbId = String(item.id);
  const detailEndpoint = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
  const detail = await fetchTMDB(`${detailEndpoint}?append_to_response=credits,videos,external_ids,release_dates,content_ratings,watch/providers`);

  const genres = (detail.genres || []).map(g => g.name);
  const cast = (detail.credits?.cast || []).slice(0, 6).map(c => c.name);
  const director = type === 'movie'
    ? (detail.credits?.crew || []).find(c => c.job === "Director")?.name || ""
    : (detail.created_by || [])[0]?.name || "";
  
  const trailer = await pickOfficialTrailer(detail.videos?.results || []);
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "";

  const collection = detectCollection(title, detail);

  const ageRating = type === 'movie'
    ? getMovieCertification(detail.release_dates?.results || [])
    : getTvCertification(detail.content_ratings?.results || []);

  // For TV shows, imdb_id lives in external_ids; for movies it's top-level
  let imdbId = detail.imdb_id || detail.external_ids?.imdb_id || "";
  if (!imdbId && tmdbId) {
    const extIds = await fetchTMDB(`${detailEndpoint}/external_ids`);
    imdbId = extIds.imdb_id || "";
  }

  let imdbRating = 0;
  if (imdbId && TMDB_API_KEY) {
    const findData = await fetchTMDB(`/find/${imdbId}?external_source=imdb_id`);
    const tmdbMatch = type === 'movie' ? findData.movie_results?.[0] : findData.tv_results?.[0];
    imdbRating = parseFloat(tmdbMatch?.vote_average?.toFixed(1)) || 0;
  }

  return Response.json({
    tmdb_id: tmdbId,
    imdb_id: imdbId,
    genres,
    cast,
    director,
    trailer_url: trailerUrl,
    collection_name: collection.collection_name,
    collection_key: collection.collection_key,
    related_keywords: collection.related_keywords,
    streaming_platforms: getWatchProviders(detail),
    watch_provider_region: 'AU',
    source_url: `https://www.themoviedb.org/${type === 'tv_show' ? 'tv' : 'movie'}/${tmdbId}`,
    poster_url: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : "",
    backdrop_url: detail.backdrop_path ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}` : "",
    year: type === 'movie' ? parseInt(detail.release_date?.slice(0, 4)) : parseInt(detail.first_air_date?.slice(0, 4)),
    rating: parseFloat(detail.vote_average?.toFixed(1)) || 0,
    imdb_rating: imdbRating,
    content_rating: ageRating.content_rating,
    age_rating_country: ageRating.age_rating_country,
    duration_minutes: detail.runtime || null,
    seasons: detail.number_of_seasons || null
  });
});
