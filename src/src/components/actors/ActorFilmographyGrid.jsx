import { Check, Film, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ActorFilmographyGrid({ credits, libraryTitles, added, onAdd }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Complete Filmography</p>
          <h2 className="mt-1 text-2xl font-black text-foreground">Movies, TV, Voice Work & Appearances</h2>
        </div>
        <p className="text-sm text-muted-foreground">{credits.length} credits</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {credits.map((item, index) => {
          const alreadyAdded = added.has(item.title) || libraryTitles.has(item.title?.toLowerCase());
          return (
            <article key={`${item.tmdb_id || item.title}-${index}`} className="flex gap-4 rounded-3xl border border-border bg-secondary/30 p-4 hover:border-primary/40">
              <div className="h-36 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                {item.poster_url ? <img src={item.poster_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center"><Film className="h-7 w-7 text-primary" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 font-black text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.year || 'Unknown year'} • {item.type === 'tv_show' ? 'TV Show' : 'Movie'} {item.rating ? `• ⭐ ${item.rating.toFixed(1)}` : ''}</p>
                {item.character && <p className="mt-1 text-xs font-bold text-primary">Role: {item.character}</p>}
                <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground">{item.synopsis || 'No synopsis available.'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.genres?.slice(0, 2).map(genre => <span key={genre} className="rounded-full bg-background px-2 py-1 text-[11px] font-bold text-muted-foreground">{genre}</span>)}
                  {item.rating && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-400"><Star className="h-3 w-3 fill-yellow-400" />{item.rating.toFixed(1)}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => !alreadyAdded && onAdd(item)} disabled={alreadyAdded} className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-black ${alreadyAdded ? 'bg-green-500/20 text-green-400' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                    {alreadyAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    {alreadyAdded ? 'In Library' : 'Add to Hub'}
                  </button>
                  {alreadyAdded && <Link to={`/search?q=${encodeURIComponent(item.title)}`} className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-xs font-black text-muted-foreground hover:text-foreground">Open</Link>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}