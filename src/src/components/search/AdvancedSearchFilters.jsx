import { Filter, Sparkles } from 'lucide-react';

const MOODS = ['Feel-good', 'Dark', 'Funny', 'Epic', 'Scary', 'Romantic', 'Family', 'Action-packed', 'Educational', 'Relaxing', 'Inspiring', 'True crime', 'Background', 'Workout'];
const PLATFORMS = ['Netflix', 'Prime Video', 'Disney+', 'Stan', 'Binge', 'Apple TV+', 'Paramount+', 'ABC iview', 'SBS On Demand', 'YouTube', 'Tubi', 'Pluto TV'];

export default function AdvancedSearchFilters({ mood, setMood, director, setDirector, platform, setPlatform, yearFilter, setYearFilter, genreFilter, setGenreFilter, genres }) {
  const hasFilters = mood || director || platform || yearFilter || genreFilter;

  return (
    <div className="rounded-3xl border border-primary/20 bg-card/70 p-4 card-glow">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
        <Sparkles className="h-4 w-4" /> Advanced AI filters
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <select value={mood} onChange={e => setMood(e.target.value)} className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          <option value="">Any mood</option>
          {MOODS.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <input value={director} onChange={e => setDirector(e.target.value)} placeholder="Director" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <select value={platform} onChange={e => setPlatform(e.target.value)} className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          <option value="">Any source/platform</option>
          {PLATFORMS.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <input type="number" value={yearFilter} onChange={e => setYearFilter(e.target.value)} placeholder="Year" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          <option value="">Any genre</option>
          {genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
        </select>
      </div>
      {hasFilters && (
        <button type="button" onClick={() => { setMood(''); setDirector(''); setPlatform(''); setYearFilter(''); setGenreFilter(''); }} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
          <Filter className="h-4 w-4" /> Clear filters
        </button>
      )}
    </div>
  );
}
