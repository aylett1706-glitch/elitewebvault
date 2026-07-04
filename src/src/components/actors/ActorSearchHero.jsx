import { Search, Sparkles, Loader2 } from 'lucide-react';

export default function ActorSearchHero({ query, setQuery, onSearch, loading }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 md:p-10 card-glow">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.22),transparent_38%),radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.16),transparent_34%)]" />
      <div className="relative max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary">
          <Sparkles className="h-4 w-4" /> AI-Powered Actor & Filmography Hub
        </div>
        <h1 className="font-bebas text-6xl tracking-wider text-foreground md:text-8xl">Actor Discovery</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          Search any actor to generate a cinematic profile, career insights, full filmography, and one-click links into your Movies and TV hubs.
        </p>
        <form onSubmit={onSearch} className="mt-7 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="actor-search">Search actor</label>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="actor-search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Keanu Reeves, Margot Robbie, Tom Hardy…"
              className="min-h-12 w-full rounded-2xl border border-border bg-secondary/80 py-3 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary/70"
            />
          </div>
          <button disabled={loading || !query.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-black text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Generate Hub
          </button>
        </form>
      </div>
    </section>
  );
}