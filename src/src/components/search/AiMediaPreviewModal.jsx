import { X, Star, Clock, Plus, Check, Film } from 'lucide-react';
import TrailerEmbed from '@/components/media/TrailerEmbed';

export default function AiMediaPreviewModal({ item, alreadyAdded, onAdd, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative h-72 overflow-hidden rounded-t-3xl bg-secondary">
          {item.backdrop_url ? (
            <img src={item.backdrop_url} alt={item.title} className="h-full w-full object-cover opacity-70" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Film className="h-14 w-14 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative -mt-24 grid gap-6 p-5 md:grid-cols-[180px,1fr] md:p-8">
          <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-secondary shadow-2xl">
            {item.poster_url ? (
              <img src={item.poster_url} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Film className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="pt-16 md:pt-20">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase text-primary">
                {item.type === 'tv_show' ? 'TV Show' : 'Movie'}
              </span>
              {item.year && <span>{item.year}</span>}
              {item.rating && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-yellow-400" /> {item.rating.toFixed(1)}
                </span>
              )}
              {item.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {item.duration_minutes} min
                </span>
              )}
            </div>

            <h2 className="font-bebas text-5xl tracking-wide text-foreground">{item.title}</h2>
            {item.collection_name && <p className="mt-1 text-sm font-bold text-primary">{item.collection_name}</p>}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.synopsis || 'No synopsis available.'}</p>

            {item.genres?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.genres.slice(0, 6).map(genre => (
                  <span key={genre} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => !alreadyAdded && onAdd(item)}
              disabled={alreadyAdded}
              className={`mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                alreadyAdded
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
              }`}
            >
              {alreadyAdded ? <><Check className="h-4 w-4" /> Added</> : <><Plus className="h-4 w-4" /> Add to library</>}
            </button>
          </div>
        </div>

        <div className="px-5 pb-8 md:px-8">
          {item.trailer_url ? (
            <TrailerEmbed trailerUrl={item.trailer_url} title={item.title} />
          ) : (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No trailer found for this title.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
