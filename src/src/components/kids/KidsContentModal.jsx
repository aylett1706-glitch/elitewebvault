import { useEffect, useRef, useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { Check, Film, Loader2, Plus, Search, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageSourceField from '@/components/media/ImageSourceField';

const AGE_GROUPS = ['All Ages', '3+', '7+', '10+', '13+'];
const KIDS_GENRES = ['Animation', 'Family', 'Kids', 'Adventure', 'Comedy', 'Fantasy', 'Musical', 'Educational'];

const emptyForm = {
  title: '', type: 'movie', synopsis: '', year: '', rating: '', genres: ['Family'],
  poster_url: '', backdrop_url: '', video_url: '', trailer_url: '', kids_age_group: 'All Ages'
};

export default function KidsContentModal({ onClose, onAdded }) {
  const [mode, setMode] = useState('ai');
  const [query, setQuery] = useState('');
  const [suggestedQuery, setSuggestedQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [form, setForm] = useState(emptyForm);
  const suggestionTimer = useRef(null);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const resultKey = (item) => `${item.type}-${item.tmdb_id || item.title}`;
  const toggleSelected = (key) => setSelected(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  useEffect(() => {
    clearTimeout(suggestionTimer.current);
    const text = query.trim();
    if (text.length < 3) {
      setSuggestedQuery('');
      setSuggestions([]);
      return;
    }

    suggestionTimer.current = setTimeout(async () => {
      setAiThinking(true);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest optional kids/family movie or TV searches related to this exact query. Do not block or replace the user's query; only provide optional alternatives. Include TMDB-friendly and TVMaze-friendly phrasing when useful. Keep it child-safe. Query: "${text}"`,
        response_json_schema: {
          type: 'object',
          properties: {
            corrected_query: { type: 'string' },
            suggestions: { type: 'array', items: { type: 'string' } }
          },
          required: ['corrected_query', 'suggestions']
        }
      });
      setSuggestedQuery(res.corrected_query || text);
      setSuggestions((res.suggestions || []).slice(0, 4));
      setAiThinking(false);
    }, 600);

    return () => clearTimeout(suggestionTimer.current);
  }, [query]);

  const searchKids = async (e, overrideQuery) => {
    e?.preventDefault?.();
    const searchTerm = (overrideQuery || query).trim();
    if (!searchTerm) return;
    setQuery(searchTerm);
    setLoading(true);
    const res = await base44.functions.invoke('tmdbSearch', { query: searchTerm });
    const safe = (res.data?.results || []).filter(item => {
      const genres = (item.genres || []).join(' ').toLowerCase();
      const text = `${item.title || ''} ${genres} ${item.synopsis || ''}`.toLowerCase();
      const matureRating = ['R', 'NC-17', 'TV-MA', 'MA15+', 'R18+', 'X18+'].includes(item.content_rating);
      return !matureRating && !text.includes('adult') && !text.includes('horror') && (genres.includes('family') || genres.includes('animation') || genres.includes('adventure') || genres.includes('comedy') || genres.includes('fantasy'));
    });
    setResults(safe);
    setSelected(new Set());
    setLoading(false);
  };

  const createKidsItem = async (item) => {
    const payload = {
      title: item.title,
      type: item.type,
      synopsis: item.synopsis,
      year: item.year ? Number(item.year) : undefined,
      rating: item.rating ? Number(item.rating) : undefined,
      genres: item.genres?.length ? item.genres : ['Family'],
      cast: item.cast || [],
      director: item.director || '',
      poster_url: item.poster_url || '',
      backdrop_url: item.backdrop_url || '',
      video_url: item.video_url || '',
      trailer_url: item.trailer_url || '',
      content_rating: item.content_rating || '',
      age_rating_country: item.age_rating_country || '',
      tmdb_id: item.tmdb_id || '',
      imdb_id: item.imdb_id || '',
      source_url: item.source_url || (item.tmdb_id ? `https://www.themoviedb.org/${item.type === 'tv_show' ? 'tv' : 'movie'}/${item.tmdb_id}` : ''),
      content_notes: `Kids library item added from trusted TMDB data source. Age group: ${item.kids_age_group || 'All Ages'}.`,
      duration_minutes: item.duration_minutes || undefined,
      seasons: item.seasons || undefined,
      status: 'approved',
      is_adult: false,
      is_kids: true,
      kids_age_group: item.kids_age_group || 'All Ages',
      views: 0,
      language: item.language || 'en'
    };
    const created = await base44.entities.Media.create(payload);
    onAdded?.(created);
    return created;
  };

  const addSearchResult = async (item) => {
    setAdded(prev => new Set([...prev, item.title]));
    const created = await createKidsItem({ ...item, kids_age_group: form.kids_age_group });
    toast.success(`"${created.title}" added to Kids`);
  };

  const addSelectedResults = async () => {
    const selectedItems = results.filter(item => selected.has(resultKey(item)) && !added.has(item.title));
    if (!selectedItems.length) return;
    setSaving(true);
    for (const item of selectedItems) {
      await addSearchResult(item);
    }
    setSelected(new Set());
    setSaving(false);
  };

  const saveManual = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    const created = await createKidsItem({
      ...form,
      cast: [],
      year: form.year ? Number(form.year) : undefined,
      rating: form.rating ? Number(form.rating) : undefined
    });
    toast.success(`"${created.title}" added to Kids`);
    setForm(emptyForm);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Kids & Family Content</h2>
            <p className="text-xs text-muted-foreground">Search uses your exact text first, with TMDB as primary metadata and TVMaze as a TV backup source.</p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-secondary p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex gap-2 border-b border-border p-4">
          {[
            ['ai', 'AI Search'],
            ['manual', 'Manual Add']
          ].map(([value, label]) => (
            <button key={value} onClick={() => setMode(value)} className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{label}</button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Age</span>
            <select value={form.kids_age_group} onChange={(e) => setField('kids_age_group', e.target.value)} className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
              {AGE_GROUPS.map(age => <option key={age} value={age}>{age}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {mode === 'ai' ? (
            <div className="space-y-4">
              <form onSubmit={searchKids} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trusted TMDB for kids movies or family TV shows..." className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary/60 focus:outline-none" autoFocus />
                </div>
                <button disabled={loading || !query.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Search
                </button>
              </form>
              {(aiThinking || suggestedQuery || suggestions.length > 0) && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{aiThinking ? 'AI finding optional alternatives...' : 'Optional AI suggestions'}</p>
                  {suggestedQuery && suggestedQuery !== query.trim() && (
                    <button onClick={() => searchKids(null, suggestedQuery)} className="mb-2 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                      Try suggestion: {suggestedQuery}
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(item => (
                      <button key={item} onClick={() => searchKids(null, item)} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {results.length > 0 && (
                <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 p-3">
                  <p className="text-sm text-muted-foreground">{selected.size} selected</p>
                  <button onClick={addSelectedResults} disabled={saving || selected.size === 0} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">
                    <Plus className="h-3.5 w-3.5" /> {saving ? 'Adding...' : 'Add Selected'}
                  </button>
                </div>
              )}
              <div className="space-y-3">
                {results.map((item) => {
                  const key = resultKey(item);
                  const isAdded = added.has(item.title);
                  const isSelected = selected.has(key);
                  return (
                    <div key={key} className={`flex gap-3 rounded-2xl border p-3 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-secondary/50'}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAdded}
                        onChange={() => toggleSelected(key)}
                        className="mt-9 h-4 w-4 rounded border-border accent-primary disabled:opacity-40"
                        aria-label={`Select ${item.title}`}
                      />
                      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                        {item.poster_url ? <img src={item.poster_url} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Film className="h-5 w-5 text-muted-foreground" /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground">{item.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{item.year} · {item.type === 'tv_show' ? 'TV Show' : 'Movie'} · {(item.genres || []).slice(0, 3).join(', ')}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-primary">Trusted source: TMDB</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.synopsis}</p>
                      </div>
                      <button onClick={() => !isAdded && addSearchResult(item)} className={`h-fit rounded-xl px-4 py-2 text-xs font-bold ${isAdded ? 'bg-green-500/20 text-green-400' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                        {isAdded ? <><Check className="mr-1 inline h-3 w-3" /> Added</> : <><Plus className="mr-1 inline h-3 w-3" /> Add</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Title" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground" />
                <select value={form.type} onChange={(e) => setField('type', e.target.value)} className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">
                  <option value="movie">Kids Movie</option>
                  <option value="tv_show">Kids TV Show</option>
                </select>
                <input type="number" value={form.year} onChange={(e) => setField('year', e.target.value)} placeholder="Year" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground" />
                <input value={form.video_url} onChange={(e) => setField('video_url', e.target.value)} placeholder="Video URL" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground" />
              </div>
              <textarea value={form.synopsis} onChange={(e) => setField('synopsis', e.target.value)} rows={3} placeholder="Relevant info / description..." className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground" />
              <div className="flex flex-wrap gap-2">
                {KIDS_GENRES.map(genre => (
                  <button key={genre} onClick={() => setField('genres', form.genres.includes(genre) ? form.genres.filter(g => g !== genre) : [...form.genres, genre])} className={`rounded-full px-3 py-1.5 text-xs font-bold ${form.genres.includes(genre) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{genre}</button>
                ))}
              </div>
              <ImageSourceField label="Poster Picture" value={form.poster_url} onChange={(url) => setField('poster_url', url)} aspect="aspect-[2/3]" />
              <ImageSourceField label="Backdrop Picture" value={form.backdrop_url} onChange={(url) => setField('backdrop_url', url)} />
              <button onClick={saveManual} disabled={saving} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
                {saving ? 'Saving...' : 'Add to Kids Library'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
