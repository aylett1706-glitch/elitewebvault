import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Music, Search, Loader2, Plus, Check, Play, Headphones, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { webAISearchMusic } from '@/lib/web-ai-search';

export default function MusicHub() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [library, setLibrary] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    const items = await base44.entities.Music.filter({ status: 'approved' }, '-created_date', 100);
    setLibrary(items);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAiResults([]);
    try {
      const results = await webAISearchMusic({ query, limit: 30 });
      setAiResults(results);
    } catch {
      setAiResults([]);
    }
    setLoading(false);
  };

  const addToLibrary = async (item) => {
    await base44.entities.Music.create({
      title: item.title,
      artist: item.artist,
      album: item.album || '',
      genre: item.genre || '',
      year: item.year,
      duration_seconds: item.duration_seconds,
      cover_url: item.cover_url || '',
      stream_url: item.stream_url || '',
      preview_url: item.preview_url || '',
      source_url: item.source_url || '',
      source_name: item.source_name || '',
      is_free: item.is_free !== false,
      license_type: item.license_type || '',
      language: item.language || 'en',
      status: 'approved',
      views: 0
    });
    setAddedIds(prev => new Set([...prev, item.title + item.artist]));
    toast.success(`"${item.title}" added to library!`);
    loadLibrary();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="pt-24 max-w-screen-xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-accent" />
          </div>
          <h1 className="font-bebas text-4xl md:text-5xl text-foreground">Music Hub</h1>
        </div>

        <p className="text-muted-foreground text-sm mb-6">Discover free and legal music from across the web — Free Music Archive, Jamendo, Musopen, Internet Archive, and more.</p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search artists, songs, albums, genres..."
                className="w-full bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60"
              />
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-4 rounded-2xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex items-center gap-3 py-12">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <p className="text-sm text-muted-foreground">Searching the web for free music...</p>
          </div>
        )}

        {!loading && aiResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-accent" /> Web Results ({aiResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiResults.map((item, i) => {
                const added = addedIds.has(item.title + item.artist) || library.some(m => m.title === item.title && m.artist === item.artist);
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex gap-4 bg-card border border-border rounded-2xl p-4 hover:border-accent/30 transition-colors">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                      {item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Music className="w-6 h-6 text-muted-foreground" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">{item.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
                      {item.album && <p className="text-xs text-muted-foreground truncate">{item.album}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {item.genre && <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{item.genre}</span>}
                        {item.year && <span className="text-xs text-muted-foreground">{item.year}</span>}
                        {item.is_free && <span className="text-xs px-1.5 py-0.5 bg-green-500/15 rounded text-green-300">Free</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {item.stream_url && <a href={item.stream_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"><Play className="w-3 h-3" /> Listen</a>}
                        <button onClick={() => !added && addToLibrary(item)} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}>
                          {added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {library.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Your Library ({library.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {library.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary mb-2 group cursor-pointer" onClick={() => item.stream_url && window.open(item.stream_url, '_blank')}>
                    {item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center"><Music className="w-8 h-8 text-muted-foreground" /></div>}
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!loading && !aiResults.length && !library.length && (
          <div className="text-center py-20">
            <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">Search for music</p>
            <p className="text-muted-foreground text-sm">Find free, legal music from across the web</p>
          </div>
        )}
      </div>
    </div>
  );
}
