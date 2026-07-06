import { useState } from 'react';
import { Star } from 'lucide-react';

export default function PostWatchRating({ media, completed, currentRating, onMarkWatched, onRate }) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || currentRating || 0;

  return (
    <section className="mx-auto max-w-screen-xl px-4 md:px-8 py-8">
      <div className="rounded-2xl border border-border bg-card/80 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Your rating</p>
            <h2 className="mt-1 text-xl font-black text-foreground">Rate {media.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {completed ? 'Thanks for watching. Tap a star to save your rating.' : 'Mark this as watched when you finish, then add your star rating.'}
            </p>
          </div>

          {!completed ? (
            <button
              type="button"
              onClick={onMarkWatched}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground hover:bg-primary/90"
            >
              I finished watching
            </button>
          ) : (
            <div className="flex items-center gap-2" aria-label="Rate this title out of 5 stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onFocus={() => setHoverRating(value)}
                  onBlur={() => setHoverRating(0)}
                  onClick={() => onRate(value)}
                  className="rounded-lg p-1 text-yellow-400 hover:scale-110"
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                >
                  <Star className={`h-8 w-8 ${displayRating >= value ? 'fill-yellow-400' : 'fill-transparent'}`} />
                </button>
              ))}
              {currentRating > 0 && <span className="ml-2 text-sm font-bold text-foreground">{currentRating}/5</span>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}