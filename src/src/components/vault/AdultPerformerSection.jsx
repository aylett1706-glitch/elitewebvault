import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Search, Loader2, UserRound, Sparkles } from 'lucide-react';
import { toDisplayImageUrl } from './imageUrl';
import PerformerMetaBadges from './PerformerMetaBadges';

const CACHE_KEY = 'ev_adult_performers_cache_v2';
const SAVED_CACHE_KEY = 'ev_saved_performers_cache_v1';

const FEATURED_PERFORMERS = [
  {
    name: 'Angela White',
    bio: 'Australian adult performer, director, and award-winning creator with a large public catalogue.',
    portrait_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Angela_White_2019.jpg',
    cover_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Angela_White_2019.jpg',
    profile_url: 'https://www.theangelawhite.com',
    categories: ['Award Winner', 'Creator', 'Australia']
  },
  {
    name: 'Riley Reid',
    bio: 'Public adult performer and creator known for a large filmography and creator-led content.',
    portrait_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Riley_Reid_2016.jpg',
    cover_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Riley_Reid_2016.jpg',
    profile_url: 'https://www.itsrileyreid.com',
    categories: ['Creator', 'Popular', 'Official']
  },
  {
    name: 'Abella Danger',
    bio: 'American adult performer and online creator with a highly recognised public profile.',
    portrait_url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Abella_Danger_2016.jpg',
    cover_url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Abella_Danger_2016.jpg',
    profile_url: 'https://twitter.com/Abella_Danger',
    categories: ['Creator', 'Popular', 'Official']
  },
  {
    name: 'Lana Rhoades',
    bio: 'Public adult creator and media personality with a well-known online following.',
    portrait_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Lana_Rhoades_2017.jpg',
    cover_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Lana_Rhoades_2017.jpg',
    profile_url: 'https://twitter.com/LanaRhoades',
    categories: ['Creator', 'OnlyFans Style', 'Popular']
  },
  {
    name: 'Mia Malkova',
    bio: 'Adult performer, streamer, and subscription creator with public creator profiles.',
    portrait_url: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Mia_Malkova_2016.jpg',
    cover_url: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Mia_Malkova_2016.jpg',
    profile_url: 'https://twitter.com/MiaMalkova',
    categories: ['Creator', 'Streamer', 'Official']
  },
  {
    name: 'Kendra Sunderland',
    bio: 'Adult creator and subscription-platform personality with a public online presence.',
    portrait_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Kendra_Sunderland_2019.jpg',
    cover_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Kendra_Sunderland_2019.jpg',
    profile_url: 'https://twitter.com/KSLibraryGirl',
    categories: ['OnlyFans Style', 'Creator', 'Official']
  }
];

export default function AdultPerformerSection() {
  const [query, setQuery] = useState('');
  const [performers, setPerformers] = useState(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : FEATURED_PERFORMERS;
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadSavedPerformers = async () => {
    const cachedSaved = sessionStorage.getItem(SAVED_CACHE_KEY);
    if (cachedSaved) {
      const mapped = JSON.parse(cachedSaved);
      setPerformers(prev => [...mapped, ...prev].filter((item, index, arr) => arr.findIndex(other => other.name === item.name) === index));
    }

    const saved = await base44.entities.Performer.list('-updated_date', 100);
    if (!saved.length) return;
    setPerformers(prev => {
      const mapped = saved.map(item => ({
        ...item,
        portrait_url: item.photo_url || item.portrait_url || '',
        cover_url: item.cover_url || item.photo_url || item.portrait_url || '',
        categories: item.tags || item.categories || []
      }));
      sessionStorage.setItem(SAVED_CACHE_KEY, JSON.stringify(mapped));
      const merged = [...mapped, ...prev].filter((item, index, arr) => arr.findIndex(other => other.name === item.name) === index);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const loadPerformers = async ({ nextPage = 1, append = false } = {}) => {
    setLoading(true);
    const res = await base44.functions.invoke('adultPerformerSearch', { query, page: nextPage });
    const next = res.data?.performers || [];
    setPerformers(prev => {
      const merged = append ? [...prev, ...next] : next;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      return merged;
    });
    setPage(nextPage);
    setHasMore(next.length > 0);
    setLoading(false);
  };

  useEffect(() => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(performers.length ? performers : FEATURED_PERFORMERS));
    loadSavedPerformers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPerformers({ nextPage: 1 });
  };

  return (
    <section className="mb-10">
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-red-400" />
            <h2 className="text-2xl font-bold text-foreground">Adult Actresses</h2>
          </div>
          <p className="text-sm text-muted-foreground">Browse performer pages with cover art and video collections.</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actresses..."
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500/60"
          />
        </form>
      </div>

      {loading && performers.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-7 h-7 text-red-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {performers.map((performer, index) => (
            <Link
              key={`${performer.name}-${index}`}
              to={`/vault/performer/${encodeURIComponent(performer.name)}`}
              className="group overflow-hidden rounded-2xl border border-red-900/30 bg-card hover:border-red-500/50 transition-all"
            >
              <div className="relative aspect-video bg-secondary overflow-hidden">
                {performer.cover_url || performer.portrait_url ? (
                  <img
                    src={toDisplayImageUrl(performer.cover_url || performer.portrait_url || performer.photo_url, 640, 360)}
                    alt={performer.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const fallback = toDisplayImageUrl(performer.portrait_url || performer.photo_url || performer.cover_url, 640, 360);
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><UserRound className="w-10 h-10 text-muted-foreground" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">{performer.name}</h3>
                  <p className="text-white/70 text-xs mt-1 line-clamp-2">{performer.bio || 'View profile and videos'}</p>
                  <div className="mt-2">
                    <PerformerMetaBadges performer={performer} compact />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasMore && performers.length > 0 && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => loadPerformers({ nextPage: page + 1, append: true })}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Load More Actresses
          </button>
        </div>
      )}
    </section>
  );
}