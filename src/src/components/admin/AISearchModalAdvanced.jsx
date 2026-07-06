import { useState, useMemo, useEffect } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { X, Search, Loader2, Plus, Check, Film, Star, SlidersHorizontal, ChevronDown, Image, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { webAISearch, webImageSearch } from '@/lib/web-ai-search';

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'];
const LANGUAGES = [
  { label: 'Any', value: '' },
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'Korean', value: 'ko' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Italian', value: 'it' },
  { label: 'German', value: 'de' },
];

export default function AISearchModalAdvanced({ onClose, onAdded, defaultType }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const [adding, setAdding] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState('title');

  // Filters
  const [mediaType, setMediaType] = useState(defaultType || '');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [minRating, setMinRating] = useState('');
  const [language, setLanguage] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    base44.entities.Media.filter({ status: 'approved' }, '-created_date', 500).then(setLibraryItems);
  }, []);

  const activeFilterCount = selectedGenres.length + (yearFrom ? 1 : 0) + (yearTo ? 1 : 0) + (minRating ? 1 : 0) + (language ? 1 : 0) + (mediaType ? 1 : 0) + (sortBy !== 'popularity' ? 1 : 0);

  const toggleGenre = (g) => setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const matchesGenre = (itemGenres = [], selectedGenre) => {
    const normalized = itemGenres.map(g => g.toLowerCase());
    const target = selectedGenre.toLowerCase();
    const aliases = {
      adventure: ['adventure', 'action & adventure'],
      action: ['action', 'action & adventure'],
      fantasy: ['fantasy', 'sci-fi & fantasy'],
      'science fiction': ['science fiction', 'sci-fi & fantasy'],
      horror: ['horror', 'mystery'],
      history: ['history', 'war & politics'],
      war: ['war', 'war & politics']
    };
    return (aliases[target] || [target]).some(alias => normalized.includes(alias));
  };

  const combinedResults = useMemo(() => {
    const savedKeys = new Set(libraryItems.map(item => `${item.type}:${String(item.tmdb_id || item.title).toLowerCase()}`));
    const aiResults = results.map(item => ({ ...item, in_library: savedKeys.has(`${item.type}:${String(item.tmdb_id || item.title).toLowerCase()}`) }));
    const aiKeys = new Set(aiResults.map(item => `${item.type}:${String(item.tmdb_id || item.title).toLowerCase()}`));
    const localMatches = libraryItems
      .filter(item => {
        const q = query.trim().toLowerCase();
        if (!q) return false;
        const text = `${item.title || ''} ${(item.cast || []).join(' ')} ${(item.genres || []).join(' ')} ${item.synopsis || ''}`.toLowerCase();
        return text.includes(q);
      })
      .map(item => ({ ...item, in_library: true, local_library: true }))
      .filter(item => !aiKeys.has(`${item.type}:${String(item.tmdb_id || item.title).toLowerCase()}`));
    return [...localMatches, ...aiResults];
  }, [results, libraryItems, query]);

  const filteredResults = useMemo(() => {
    let r = [...combinedResults];
    if (mediaType) r = r.filter(x => x.type === mediaType);
    if (selectedGenres.length) r = r.filter(x => selectedGenres.every(g => matchesGenre(x.genres, g)));
    if (yearFrom) r = r.filter(x => (x.year || 0) >= parseInt(yearFrom));
    if (yearTo) r = r.filter(x => (x.year || 0) <= parseInt(yearTo));
    if (minRating) r = r.filter(x => (x.rating || 0) >= parseFloat(minRating));
    if (language) r = r.filter(x => x.language === language || !x.language);

    switch (sortBy) {
      case 'rating': r.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'year_desc': r.sort((a, b) => (b.year || 0) - (a.year || 0)); break;
      case 'year_asc': r.sort((a, b) => (a.year || 0) - (b.year || 0)); break;
      case 'az': r.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return r;
  }, [combinedResults, mediaType, selectedGenres, yearFrom, yearTo, minRating, language, sortBy]);

  const runSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setResults([]);
    if (searchType === 'actor') {
      setMediaType('');
      setSelectedGenres([]);
      setYearFrom('');
      setYearTo('');
      setMinRating('');
      setLanguage('');
      setSortBy('popularity');
    }
    try {
      const webResults = await webAISearch({
        query: searchQuery.trim(),
        searchType,
        genres: selectedGenres,
        year: yearFrom || yearTo,
        type: mediaType,
        limit: searchType === 'actor' ? 60 : 40
      });
      setResults(webResults);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await runSearch(query);
  };

  const findPopularByFilters = async () => {
    setLoading(true);
    setResults([]);
    const selectedYear = yearFrom || yearTo;
    const popularQuery = selectedGenres.length
      ? `${selectedGenres.join(' ')} movies and TV shows`
      : 'most popular movies and TV shows right now';
    const webResults = await webAISearch({
      query: popularQuery,
      searchType: 'title',
      genres: selectedGenres,
      year: selectedYear,
      type: mediaType,
      limit: 60
    });
    setResults(webResults);
    setQuery(selectedGenres.length || selectedYear ? `Popular ${selectedGenres.join(', ')} ${selectedYear}`.trim() : 'Popular movies and TV shows');
    setLoading(false);
  };

  const handleImageSearch = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    setResults([]);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const analysis = await webImageSearch(file_url);
    const nextQuery = analysis?.query || '';
    if (analysis?.year) {
      setYearFrom(String(analysis.year));
      setYearTo(String(analysis.year));
    }
    if (analysis?.genres?.[0] && GENRES.includes(analysis.genres[0])) setSelectedGenres([analysis.genres[0]]);
    setQuery(nextQuery);
    if (nextQuery) await runSearch(nextQuery);
    setImageLoading(false);
    event.target.value = '';
  };

  const addToLibrary = async (item) => {
    setAdding(prev => new Set([...prev, item.title]));
    await base44.entities.Media.create({
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
      content_rating: item.content_rating || '',
      age_rating_country: item.age_rating_country || '',
      tmdb_id: item.tmdb_id || '',
      imdb_id: item.imdb_id || '',
      duration_minutes: item.duration_minutes,
      seasons: item.seasons,
      status: 'approved',
      views: 0,
      language: item.language || 'en'
    });
    setAddedIds(prev => new Set([...prev, item.title]));
    setAdding(prev => { const n = new Set(prev); n.delete(item.title); return n; });
    toast.success(`"${item.title}" added to library!`);
    if (onAdded) onAdded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> AI Search & Add</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Searches the entire web for real movies and TV shows, with live streaming sources</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search + Filter Toggle */}
        <div className="p-5 border-b border-border shrink-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              ['title', 'Title / Category'],
              ['actor', 'Actor']
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setSearchType(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${searchType === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder={searchType === 'actor' ? 'Type an actor to find all movies and TV shows they star in…' : 'Search any movie, TV show, or category…'}
                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
                autoFocus />
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 px-3 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20">
              {imageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              Image
              <input type="file" accept="image/*" onChange={handleImageSearch} className="hidden" />
            </label>
            <button type="button" onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-primary/10 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>}
            </button>
            <button type="submit" disabled={loading || imageLoading || !query.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
            <button type="button" onClick={findPopularByFilters} disabled={loading || imageLoading}
              className="flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50">
              <Star className="w-4 h-4" /> Popular
            </button>
          </form>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-4">
                  {/* Row 1: Type, Sort, Year, Rating, Language */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Type</label>
                      <select value={mediaType} onChange={e => setMediaType(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/60">
                        <option value="">Any</option>
                        <option value="movie">Movie</option>
                        <option value="tv_show">TV Show</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Sort By</label>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/60">
                        <option value="popularity">Popularity</option>
                        <option value="rating">Highest Rated</option>
                        <option value="year_desc">Newest First</option>
                        <option value="year_asc">Oldest First</option>
                        <option value="az">A–Z</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Year From</label>
                      <input type="number" placeholder="e.g. 2000" value={yearFrom} onChange={e => setYearFrom(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Year To</label>
                      <input type="number" placeholder="e.g. 2024" value={yearTo} onChange={e => setYearTo(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Min Rating</label>
                      <select value={minRating} onChange={e => setMinRating(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/60">
                        <option value="">Any</option>
                        {[9,8,7,6,5].map(r => <option key={r} value={r}>⭐ {r}+</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Language</label>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.map(l => (
                        <button key={l.value} type="button" onClick={() => setLanguage(l.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${language === l.value ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Genres</label>
                    <div className="flex flex-wrap gap-1.5">
                      {GENRES.map(g => (
                        <button key={g} type="button" onClick={() => toggleGenre(g)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${selectedGenres.includes(g) ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <button type="button" onClick={() => { setMediaType(defaultType || ''); setSelectedGenres([]); setYearFrom(''); setYearTo(''); setMinRating(''); setLanguage(''); setSortBy('popularity'); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Searching the entire web for real content and best sources...</p>
            </div>
          )}

          {!loading && combinedResults.length > 0 && filteredResults.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">No results match your filters. Try adjusting them.</p>
            </div>
          )}

          {!loading && !imageLoading && combinedResults.length === 0 && query && (
            <div className="text-center py-12">
              <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No results found. Try a different title, category, or actor.</p>
            </div>
          )}

          {!loading && !imageLoading && !query && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Search by title/category, or switch to Actor to find their full movie and TV credits from across the web.</p>
            </div>
          )}

          {filteredResults.length > 0 && (
            <p className="text-xs text-muted-foreground pb-1 flex items-center gap-1"><Globe className="w-3 h-3 text-primary" /> {filteredResults.length} web result{filteredResults.length !== 1 ? 's' : ''} from AI Search and your library</p>
          )}

          <AnimatePresence>
            {filteredResults.map((item, i) => {
              const isAdded = addedIds.has(item.title) || item.in_library;
              const isAdding = adding.has(item.title);
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex gap-3 bg-secondary/50 border border-border rounded-xl p-3 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-18 rounded-lg overflow-hidden bg-secondary shrink-0" style={{ height: '72px' }}>
                    {item.poster_url
                      ? <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-muted-foreground" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">{item.title}</h3>
                        <div className="flex items-center flex-wrap gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{item.year}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{item.type === 'tv_show' ? 'TV' : 'Movie'}</span>
                          {item.rating ? <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400" />{item.rating.toFixed(1)}</span> : null}
                          {item.content_rating && <span className="text-xs px-1.5 py-0.5 bg-emerald-500/15 rounded text-emerald-300">{item.age_rating_country ? `${item.age_rating_country} ` : ''}{item.content_rating}</span>}
                          {item.genres?.slice(0, 2).map(g => <span key={g} className="text-xs px-1.5 py-0.5 bg-background rounded text-muted-foreground">{g}</span>)}
                          {item.actor_match && <span className="text-xs px-1.5 py-0.5 bg-primary/15 rounded text-primary">{item.actor_match}{item.character ? ` as ${item.character}` : ''}</span>}
                          {item.local_library && <span className="text-xs px-1.5 py-0.5 bg-green-500/15 rounded text-green-300">In your library</span>}
                        </div>
                      </div>
                      <button onClick={() => !isAdded && !isAdding && addToLibrary(item)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isAdded ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'}`}>
                        {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : isAdded ? <><Check className="w-3 h-3" /> In Library</> : <><Plus className="w-3 h-3" /> Add</>}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{item.synopsis}</p>
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
