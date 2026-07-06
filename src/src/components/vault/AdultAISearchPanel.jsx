import { useEffect, useRef, useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { Search, Loader2, Plus, Check, Sparkles, Film, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import VideoPreviewThumb from './VideoPreviewThumb';
import { webAISearchAdult } from '@/lib/web-ai-search';

const CATEGORIES = [
  'Trending', 'Featured', 'New Releases', 'Most Viewed', 'Amateur', 'Professional', 'Couples',
  'Solo', 'Lesbian', 'Gay', 'Trans', 'MILF', 'Interracial', 'POV', 'VR', 'HD', '4K',
  'Romantic', 'Massage', 'Fitness', 'Cosplay', 'Blonde', 'Brunette', 'Redhead', 'Ebony',
  'Latina', 'Asian', 'European', 'BBW', 'Mature', 'BDSM', 'Fetish', 'Public', 'Outdoor',
  'Compilation', 'Reality', 'Verified', 'Premium', 'Elite Picks'
];

const VIDEO_CACHE_KEY = 'ev_adult_video_search_cache_v1';

const getCachedVideos = (query, category, page) => {
  const cache = JSON.parse(sessionStorage.getItem(VIDEO_CACHE_KEY) || '{}');
  return cache[`${query || ''}::${category || ''}::${page}`] || [];
};

const setCachedVideos = (query, category, page, videos) => {
  const cache = JSON.parse(sessionStorage.getItem(VIDEO_CACHE_KEY) || '{}');
  cache[`${query || ''}::${category || ''}::${page}`] = videos;
  sessionStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(cache));
};



export default function AdultAISearchPanel({ onAdded }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Trending');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [added, setAdded] = useState(new Set());
  const [blockedMessage, setBlockedMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchTimer = useRef(null);
  const loadMoreRef = useRef(null);

  const searchVideos = async ({ nextCategory = category, nextPage = 1, append = false } = {}) => {
    const cached = getCachedVideos(query, nextCategory, nextPage);
    if (cached.length) {
      setResults(prev => append ? [...prev, ...cached] : cached);
      setPage(nextPage);
      setHasMore(true);
    } else if (!append && nextPage === 1) {
      setResults([]);
      setPage(1);
      setHasMore(false);
    }
    setLoading(true);
    setBlockedMessage('');
    setCategory(nextCategory);

    try {
      const res = await webAISearchAdult({ query, category: nextCategory, limit: 24 });
      if (res.blocked) {
        setBlockedMessage(res.message || 'This search is permanently blocked.');
        setHasMore(false);
        toast.error('Blocked unsafe search');
      } else {
        const newResults = res.results || [];
        setCachedVideos(query, nextCategory, nextPage, newResults);
        setResults(prev => append ? [...prev, ...newResults] : newResults);
        setPage(nextPage);
        setHasMore(newResults.length > 0);
      }
    } catch {
      if (!append) setResults([]);
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!query.trim()) return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchVideos({ nextPage: 1 }), 250);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        searchVideos({ nextPage: page + 1, append: true });
      }
    }, { rootMargin: '500px' });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, query, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchVideos({ nextPage: 1 });
  };

  const handleCategoryClick = (cat) => {
    searchVideos({ nextCategory: cat, nextPage: 1 });
  };

  const addResult = async (item, shouldPlay = false) => {
    const sourceUrl = item.video_url || item.source_url || '';
    const created = await base44.entities.Media.create({
      title: item.title || 'Adult Video',
      type: 'movie',
      synopsis: item.synopsis || 'Adult video added from AI web search.',
      year: new Date().getFullYear(),
      rating: 0,
      genres: item.categories?.length ? item.categories : [item.category || category],
      cast: [],
      director: '',
      poster_url: item.poster_url || '',
      backdrop_url: item.poster_url || '',
      video_url: sourceUrl,
      trailer_url: '',
      duration_minutes: null,
      status: 'approved',
      is_adult: true,
      views: 0,
      language: 'en'
    });
    setAdded(prev => new Set([...prev, item.title]));
    toast.success('Added to Private Vault');
    onAdded?.();
    if (shouldPlay) navigate(`/watch/${created.id}`);
  };

  return (
    <div className="bg-card border border-red-900/30 rounded-2xl p-5 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-bold text-foreground">Ultimate Elite AI Video Search</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Strict 18+ only: minor, child, teen, underage, or age-ambiguous content is permanently blocked. Covers use real video thumbnails whenever available.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search popular adult sites like xHamster, XNXX, RedTube, YouPorn..."
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500/60"
          />
        </div>
        <button disabled={loading || (!query.trim() && !category)} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Refreshing...' : 'Search'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${category === cat ? 'bg-red-600 border-red-500 text-white' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {blockedMessage && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {blockedMessage}
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((item, index) => {
            const isAdded = added.has(item.title);
            return (
              <div key={`${item.title}-${index}`} className="flex gap-3 bg-secondary/50 border border-border rounded-xl p-3">
                <VideoPreviewThumb item={item} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground line-clamp-2">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.synopsis}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => !isAdded && addResult(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${isAdded ? 'bg-green-500/20 text-green-400' : 'bg-red-600 text-white hover:bg-red-500'}`}
                    >
                      {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                    </button>
                    <button
                      onClick={() => addResult(item, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Play className="w-3 h-3 fill-current" /> Add & Play
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && results.length > 0 && (
        <div ref={loadMoreRef} className="mt-5 flex justify-center">
          <button
            onClick={() => searchVideos({ nextPage: page + 1, append: true })}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Load More Videos
          </button>
        </div>
      )}
    </div>
  );
}
