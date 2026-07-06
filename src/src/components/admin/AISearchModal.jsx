import { useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
const base44 = supabaseApi;
import { X, Search, Loader2, Plus, Check, Film, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AISearchModal({ onClose, onAdded }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const [adding, setAdding] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    const res = await supabaseApi.functions.invoke('tmdbSearch', { query: query.trim(), searchType });
    setResults(res.data?.results || []);
    setLoading(false);
  };

  const addToLibrary = async (item) => {
    setAdding(prev => new Set([...prev, item.title]));
    await supabaseApi.entities.Media.create({
      title: item.title,
      type: item.type,
      synopsis: item.synopsis,
      year: item.year,
      rating: item.rating,
      genres: item.genres,
      cast: item.cast,
      director: item.director,
      poster_url: item.poster_url,
      backdrop_url: item.backdrop_url,
      video_url: item.video_url || '',
      trailer_url: item.trailer_url || '',
      tmdb_id: item.tmdb_id || '',
      imdb_id: item.imdb_id || '',
      duration_minutes: item.duration_minutes,
      seasons: item.seasons,
      status: 'approved',
      views: 0,
      language: 'en'
    });
    setAddedIds(prev => new Set([...prev, item.title]));
    setAdding(prev => { const n = new Set(prev); n.delete(item.title); return n; });
    toast.success(`"${item.title}" added to library!`);
    if (onAdded) onAdded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Search & Add</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Search by title, category, or actor and add content instantly</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border">
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              ['title', 'Title / Category'],
              ['actor', 'Actor']
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setSearchType(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${searchType === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchType === 'actor' ? 'Type an actor, e.g. Tom Hanks…' : 'Search movies, TV shows, or categories…'}
                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Searching TMDB...</p>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="text-center py-12">
              <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No results found. Try a different title, category, or actor.</p>
            </div>
          )}

          {!loading && results.length === 0 && !query && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Search for movies, TV shows, categories, or an actor’s starring roles</p>
            </div>
          )}

          <AnimatePresence>
            {results.map((item, i) => {
              const isAdded = addedIds.has(item.title);
              const isAdding = adding.has(item.title);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 bg-secondary/50 border border-border rounded-xl p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                    {item.poster_url
                      ? <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Film className="w-5 h-5 text-muted-foreground" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.year} • {item.type === 'tv_show' ? 'TV Show' : 'Movie'}
                          {item.rating ? <span className="ml-1.5 text-yellow-400">⭐ {item.rating.toFixed(1)}</span> : ''}
                          {item.actor_match ? <span className="ml-1.5 text-primary">• {item.actor_match}{item.character ? ` as ${item.character}` : ''}</span> : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => !isAdded && !isAdding && addToLibrary(item)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isAdded
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
                        }`}
                      >
                        {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{item.synopsis}</p>
                    {item.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.genres.slice(0, 3).map(g => (
                          <span key={g} className="px-2 py-0.5 bg-background rounded-full text-xs text-muted-foreground">{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
