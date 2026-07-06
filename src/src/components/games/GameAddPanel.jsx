import { useEffect, useRef, useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { Check, Gamepad2, Loader2, Plus, Search, Sparkles, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const INSTANT_PLAYABLE_GAMES = [
  {
    title: 'Prince of Persia',
    description: 'Classic action-platform adventure playable in the browser.',
    cover_url: 'https://archive.org/services/img/msdos_Prince_of_Persia_1990',
    genres: ['Action', 'Platformer', 'Classic'],
    platforms: ['MS-DOS', 'Browser Emulator'],
    source_type: 'emulator',
    play_url: 'https://archive.org/embed/msdos_Prince_of_Persia_1990',
    store_url: 'https://archive.org/details/msdos_Prince_of_Persia_1990',
    legal_notes: 'Playable via Internet Archive browser emulator.',
    age_rating: 'All Ages',
    tags: ['instant', 'playable', 'classic']
  },
  {
    title: 'Oregon Trail',
    description: 'Educational adventure classic playable inside the app.',
    cover_url: 'https://archive.org/services/img/msdos_Oregon_Trail_The_1990',
    genres: ['Adventure', 'Education', 'Classic'],
    platforms: ['MS-DOS', 'Browser Emulator'],
    source_type: 'emulator',
    play_url: 'https://archive.org/embed/msdos_Oregon_Trail_The_1990',
    store_url: 'https://archive.org/details/msdos_Oregon_Trail_The_1990',
    legal_notes: 'Playable via Internet Archive browser emulator.',
    age_rating: 'All Ages',
    tags: ['instant', 'playable', 'education']
  },
  {
    title: 'Doom Shareware',
    description: 'Legendary first-person action game shareware edition.',
    cover_url: 'https://archive.org/services/img/doom_dos',
    genres: ['Action', 'Shooter', 'Classic'],
    platforms: ['MS-DOS', 'Browser Emulator'],
    source_type: 'emulator',
    play_url: 'https://archive.org/embed/doom_dos',
    store_url: 'https://archive.org/details/doom_dos',
    legal_notes: 'Shareware/public archived browser emulator source.',
    age_rating: 'Teen',
    tags: ['instant', 'playable', 'shooter']
  }
];

const getInstantGames = (term) => {
  const lower = term.toLowerCase();
  return INSTANT_PLAYABLE_GAMES.filter(game => `${game.title} ${game.description} ${game.genres.join(' ')} ${game.tags.join(' ')}`.toLowerCase().includes(lower));
};

const SOURCE_TYPES = [
  ['web_game', 'Web Game'],
  ['cloud_link', 'Cloud Link'],
  ['steam', 'Steam'],
  ['xbox_cloud', 'Xbox Cloud Gaming'],
  ['playstation_cloud', 'PlayStation Cloud'],
  ['app_store', 'App Store'],
  ['emulator', 'Legal Emulator / ROM']
];

const CONTENT_CATEGORY_PRESETS = [
  'Arcade', 'Action', 'Adventure', 'Puzzle', 'Racing', 'Sports',
  'Strategy', 'Shooter', 'Platformer', 'Simulation', 'Education', 'Retro'
];

const emptyForm = {
  title: '', description: '', cover_url: '', genres: '', platforms: '', source_type: 'web_game',
  play_url: '', store_url: '', emulator_core: '', rom_url: '', rom_required: false, legal_notes: '', age_rating: 'All Ages', tags: ''
};

export default function GameAddPanel({ onClose, onAdded }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('ai');
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [added, setAdded] = useState(new Set());
  const [deepSearch, setDeepSearch] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const searchCacheRef = useRef(new Map());
  const searchRequestRef = useRef(0);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const splitList = (value) => value ? value.split(',').map(item => item.trim()).filter(Boolean) : [];

  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category]);
  };

  const addCustomCategory = () => {
    const category = customCategory.trim();
    if (!category) return;
    setSelectedCategories(prev => prev.includes(category) ? prev : [...prev, category]);
    setCustomCategory('');
  };

  const uploadRom = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setField('rom_url', file_url);
    setField('source_type', 'emulator');
    setField('rom_required', true);
    toast.success('ROM uploaded');
    setSaving(false);
  };

  const createGame = async (game) => {
    const payload = {
      ...game,
      genres: Array.isArray(game.genres) ? game.genres : splitList(game.genres),
      platforms: Array.isArray(game.platforms) ? game.platforms : splitList(game.platforms),
      tags: Array.isArray(game.tags) ? game.tags : splitList(game.tags),
      rating: Number(game.rating || 0),
      status: 'approved',
      views: 0
    };
    const created = await base44.entities.Game.create(payload);
    onAdded?.(created);
    return created;
  };

  const runGameSearch = async (searchTerm) => {
    const term = [searchTerm.trim(), selectedCategories.join(' ')].filter(Boolean).join(' ').trim();
    if (!term) {
      setSuggestions([]);
      setAiLoading(false);
      return;
    }

    const cacheKey = `${term.toLowerCase()}-${deepSearch ? 'deep' : 'quick'}`;
    if (searchCacheRef.current.has(cacheKey)) {
      setSuggestions(searchCacheRef.current.get(cacheKey));
      setAiLoading(false);
      return;
    }

    const instantGames = getInstantGames(term);
    if (instantGames.length > 0) setSuggestions(instantGames);

    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;
    setAiLoading(true);
    const res = await base44.functions.invoke('gameSearch', {
      query: term,
      limit: deepSearch ? 36 : 18,
      deep: deepSearch,
      filters: { genre: selectedCategories[0]?.toLowerCase() || 'all' }
    });
    if (requestId !== searchRequestRef.current) return;
    const results = [...instantGames, ...(res.data?.results || [])]
      .filter((game, index, array) => array.findIndex(item => item.title === game.title) === index)
      .slice(0, deepSearch ? 36 : 18);
    searchCacheRef.current.set(cacheKey, results);
    setSuggestions(results);
    setAiLoading(false);
  };

  useEffect(() => {
    const term = [query.trim(), selectedCategories.join(' ')].filter(Boolean).join(' ').trim();
    if (term.length < 2) {
      setSuggestions([]);
      setAiLoading(false);
      return;
    }

    const cached = searchCacheRef.current.get(`${term.toLowerCase()}-${deepSearch ? 'deep' : 'quick'}`);
    if (cached) {
      setSuggestions(cached);
      setAiLoading(false);
      return;
    }

    const instantGames = getInstantGames(term);
    if (instantGames.length > 0) setSuggestions(instantGames);

    const timer = setTimeout(() => runGameSearch(term), 250);
    return () => clearTimeout(timer);
  }, [query, deepSearch, selectedCategories]);

  const findGames = async (e) => {
    e.preventDefault();
    runGameSearch(query);
  };

  const addSuggestion = async (game, playNow = false) => {
    setSaving(true);
    const created = await createGame({
      ...game,
      source_type: ['web_game', 'cloud_link', 'app_store', 'emulator', 'steam', 'xbox_cloud', 'playstation_cloud'].includes(game.source_type) ? game.source_type : 'web_game',
      legal_notes: game.legal_notes || 'Added from AI discovery. Only use legal playable, cloud, store, or emulator/homebrew sources.'
    });
    setAdded(prev => new Set([...prev, game.title]));
    toast.success(`"${created.title}" added to Games`);
    setSaving(false);
    if (playNow) navigate(`/games/${created.id}/play`);
  };

  const saveManual = async () => {
    if (!form.title.trim()) {
      toast.error('Game title is required');
      return;
    }
    setSaving(true);
    const created = await createGame(form);
    toast.success(`"${created.title}" added to Games`);
    setForm(emptyForm);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Games</h2>
            <p className="text-xs text-muted-foreground">Add playable web games, uploaded legal ROMs, Steam, Xbox Cloud, PlayStation Cloud, and official store links.</p>
          </div>
          <button onClick={onClose} aria-label="Close add games" className="min-h-11 min-w-11 rounded-xl bg-secondary p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex gap-2 border-b border-border p-4">
          {['ai', 'manual'].map(value => (
            <button key={value} onClick={() => setMode(value)} className={`min-h-11 rounded-xl px-4 text-sm font-bold ${mode === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {value === 'ai' ? 'Instant Game Search' : 'Manual Add'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {mode === 'ai' ? (
            <div className="space-y-4">
              <form onSubmit={findGames} className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row">
                  <label className="sr-only" htmlFor="game-ai-search">Search for a game</label>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="game-ai-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search games, Steam, Xbox, PlayStation, arcade, DOS, shareware…" className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
                  </div>
                  <button disabled={aiLoading || !query.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {deepSearch ? 'Deep Search' : 'Search Now'}
                  </button>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/40 p-3">
                  <p className="mb-2 text-xs font-black uppercase tracking-widest text-primary">Content categories</p>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_CATEGORY_PRESETS.map(category => (
                      <button key={category} type="button" onClick={() => toggleCategory(category)} className={`rounded-full px-3 py-2 text-xs font-bold ${selectedCategories.includes(category) ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}>
                        {category}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input value={customCategory} onChange={e => setCustomCategory(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }} placeholder="Type a category, e.g. Horror, Kids, Anime…" className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
                    <button type="button" onClick={addCustomCategory} className="rounded-xl bg-primary px-4 text-xs font-black text-primary-foreground">Add</button>
                  </div>
                  {selectedCategories.length > 0 && <p className="mt-2 text-xs text-muted-foreground">AI will search: {selectedCategories.join(', ')}</p>}
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <input type="checkbox" checked={deepSearch} onChange={e => setDeepSearch(e.target.checked)} className="h-4 w-4 accent-primary" />
                  Deep search: scans playable archives, systems, classics, shareware, arcade, DOS, emulator collections and official cloud/store sources.
                </label>
              </form>
              <p className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
                Pick or type content categories, then the AI will find matching playable games automatically.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {suggestions.map(game => {
                  const isAdded = added.has(game.title);
                  return (
                    <div key={`${game.title}-${game.play_url || game.store_url}`} className="rounded-2xl border border-border bg-secondary/50 p-4">
                      <div className="flex gap-3">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card">
                          {game.cover_url ? <img src={game.cover_url} alt={game.title} className="h-full w-full object-cover" /> : <Gamepad2 className="h-8 w-8 text-primary" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-foreground">{game.title}</h3>
                          <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-muted-foreground">{game.description}</p>
                          <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-primary">{game.source_type?.replace('_', ' ') || 'web game'}{game.rating ? ` · ${Number(game.rating).toLocaleString()} plays` : ''}</p>
                          {game.tags?.length > 0 && <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{game.tags.slice(0, 5).join(' • ')}</p>}
                        </div>
                        <div className="flex shrink-0 flex-col gap-2">
                          <button onClick={() => !isAdded && addSuggestion(game)} disabled={saving || isAdded} className={`min-h-10 rounded-xl px-3 text-xs font-bold ${isAdded ? 'bg-green-500/20 text-green-400' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                            {isAdded ? <><Check className="mr-1 inline h-3 w-3" /> Added</> : <><Plus className="mr-1 inline h-3 w-3" /> Add</>}
                          </button>
                          {!isAdded && game.play_url && (
                            <button onClick={() => addSuggestion(game, true)} disabled={saving} className="min-h-10 rounded-xl border border-primary/30 px-3 text-xs font-bold text-primary hover:bg-primary/10">
                              Add & Play
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Game title" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
                <select value={form.source_type} onChange={(e) => setField('source_type', e.target.value)} className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground">
                  {SOURCE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input value={form.play_url} onChange={(e) => setField('play_url', e.target.value)} placeholder="Playable embed URL" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
                <input value={form.store_url} onChange={(e) => setField('store_url', e.target.value)} placeholder="Store / cloud / source URL" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
                <input value={form.cover_url} onChange={(e) => setField('cover_url', e.target.value)} placeholder="Cover image URL" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
                <input value={form.emulator_core} onChange={(e) => setField('emulator_core', e.target.value)} placeholder="Emulator core: nes, snes, gba, n64, psx, arcade" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
                <input value={form.rom_url} onChange={(e) => setField('rom_url', e.target.value)} placeholder="Uploaded ROM URL" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
                <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/20">
                  <Upload className="h-4 w-4" /> Upload legal ROM
                  <input type="file" accept=".nes,.sfc,.smc,.gba,.gb,.gbc,.n64,.z64,.v64,.zip,.7z,.iso,.bin,.cue,.chd" onChange={uploadRom} className="hidden" />
                </label>
                <input value={form.age_rating} onChange={(e) => setField('age_rating', e.target.value)} placeholder="Age rating" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
                <input value={form.genres} onChange={(e) => setField('genres', e.target.value)} placeholder="Genres, comma separated" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
                <input value={form.platforms} onChange={(e) => setField('platforms', e.target.value)} placeholder="Platforms, comma separated" className="rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
              </div>
              <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} placeholder="Game description" className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
              <textarea value={form.legal_notes} onChange={(e) => setField('legal_notes', e.target.value)} rows={2} placeholder="Legal/source notes for emulator or external games" className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-base text-foreground" />
              <button onClick={saveManual} disabled={saving} className="w-full min-h-11 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
                {saving ? 'Saving…' : 'Add Game'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}