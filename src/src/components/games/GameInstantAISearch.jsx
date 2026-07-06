import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Filter, Gamepad2, Loader2, Play, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const GENRE_OPTIONS = ['all', 'arcade', 'action', 'adventure', 'puzzle', 'strategy', 'racing', 'sports', 'educational', 'shooter', 'platformer', 'simulation'];
const PLATFORM_OPTIONS = [
  ['all', 'Any platform'],
  ['dos', 'MS-DOS'],
  ['flash', 'Flash'],
  ['console', 'Console'],
  ['pc', 'Classic PC']
];
const EMULATOR_OPTIONS = [
  ['all', 'Any emulator'],
  ['dos', 'DOSBox'],
  ['flash', 'Ruffle / Flash'],
  ['console', 'Console emulator']
];
const ROM_SOURCE_OPTIONS = [
  ['emubrowser', 'EmuBrowser'],
  ['retroarch', 'RetroArch'],
  ['nesOnline', 'NES Online'],
  ['classicjoy', 'ClassicJoy'],
  ['moregames', 'MoreGames'],
  ['webmulator', 'Webmulator'],
  ['classicemu', 'ClassicEmu'],
  ['retrorvault', 'RetroVault'],
  ['playerretro', 'PlayerRetro']
];

export default function GameInstantAISearch({ onAdded }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ genre: 'all', year: '', title: '', platform: 'all', emulator: 'all' });
  const [selectedSources, setSelectedSources] = useState(['classicjoy', 'webmulator', 'classicemu', 'retrorvault']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(new Set());
  const cacheRef = useRef(new Map());
  const requestRef = useRef(0);

  const searchGames = async (term, activeFilters = filters) => {
    const clean = term.trim() || activeFilters.title.trim();
    if (clean.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const normalizedFilters = {
      ...activeFilters,
      year: activeFilters.year.trim(),
      title: activeFilters.title.trim()
    };
    const cacheKey = JSON.stringify({ query: clean.toLowerCase(), filters: normalizedFilters, selectedSources });
    if (cacheRef.current.has(cacheKey)) {
      setResults(cacheRef.current.get(cacheKey));
      setLoading(false);
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    const res = await base44.functions.invoke('gameSearch', { query: clean, limit: 24, deep: true, instantOnly: true, filters: normalizedFilters, selectedSources });
    if (requestId !== requestRef.current) return;
    const playable = (res.data?.results || []).filter(game => game.play_url || game.rom_url);
    cacheRef.current.set(cacheKey, playable);
    setResults(playable);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => searchGames(query, filters), 180);
    return () => clearTimeout(timer);
  }, [query, filters, selectedSources]);

  const toggleSource = (source) => {
    setSelectedSources(prev => prev.includes(source) ? prev.filter(item => item !== source) : [...prev, source]);
  };

  const addGame = async (game, playNow = true) => {
    const created = await base44.entities.Game.create({
      ...game,
      status: 'approved',
      views: 0,
      tags: [...new Set([...(game.tags || []), 'instant', 'playable', 'ai-search'])]
    });
    setAdded(prev => new Set([...prev, game.title]));
    onAdded?.(created);
    toast.success('Launching playable game');
    if (playNow) navigate(`/games/${created.id}/play`);
  };

  return (
    <section className="mb-8 rounded-3xl border border-primary/20 bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-black text-foreground">Instant Playable AI Game Search</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search instant playable browser games, classics, arcade, DOS, puzzle…" className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60" />
        </div>
        <input value={filters.title} onChange={event => setFilters(prev => ({ ...prev, title: event.target.value }))} placeholder="Title contains…" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60" />
        <input value={filters.year} onChange={event => setFilters(prev => ({ ...prev, year: event.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))} placeholder="Year, e.g. 1998" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60" />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select value={filters.genre} onChange={event => setFilters(prev => ({ ...prev, genre: event.target.value }))} className="w-full appearance-none rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm font-bold text-foreground focus:border-primary/60">
            {GENRE_OPTIONS.map(item => <option key={item} value={item}>{item === 'all' ? 'Any genre' : item}</option>)}
          </select>
        </label>
        <select value={filters.platform} onChange={event => setFilters(prev => ({ ...prev, platform: event.target.value }))} className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground focus:border-primary/60">
          {PLATFORM_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filters.emulator} onChange={event => setFilters(prev => ({ ...prev, emulator: event.target.value }))} className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground focus:border-primary/60">
          {EMULATOR_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-3">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-primary">ROM source detection</p>
        <div className="flex flex-wrap gap-2">
          {ROM_SOURCE_OPTIONS.map(([value, label]) => (
            <button key={value} type="button" onClick={() => toggleSource(value)} className={`rounded-full px-3 py-2 text-xs font-bold ${selectedSources.includes(value) ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs font-bold text-muted-foreground">Only games with a ready in-app Play button or detected direct ROM link are shown. Import ROMs only when you have the right to use them.</p>
      {loading && <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Finding playable games…</div>}
      {results.length > 0 && (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map(game => {
            const isAdded = added.has(game.title);
            return (
              <div key={`${game.title}-${game.play_url}`} className="rounded-2xl border border-border bg-secondary/50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card">
                    {game.cover_url ? <img src={game.cover_url} alt={game.title} className="h-full w-full object-cover" /> : <Gamepad2 className="h-8 w-8 text-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-foreground">{game.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{game.description}</p>
                    <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-primary">Instant in-app play</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => !isAdded && addGame(game, true)} disabled={isAdded} className={`min-h-10 flex-1 rounded-xl text-xs font-black ${isAdded ? 'bg-green-500/20 text-green-400' : 'bg-primary text-primary-foreground'}`}>
                    {isAdded ? <><Check className="mr-1 inline h-3 w-3" /> Added</> : <><Play className="mr-1 inline h-3 w-3" /> Play Now</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}