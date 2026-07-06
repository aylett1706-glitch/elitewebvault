import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Film, Gamepad2, Play, Star, Tv } from 'lucide-react';
import { hideWallpaperPreview, showWallpaperPreview } from '@/lib/wallpaper-preview';

const tabs = [
  { key: 'movies', label: 'Movies', icon: Film, path: '/movies' },
  { key: 'tv', label: 'TV Shows', icon: Tv, path: '/tv-shows' },
  { key: 'games', label: 'Games', icon: Gamepad2, path: '/games' },
  { key: 'books', label: 'Books', icon: BookOpen, path: '/books' },
];

const getPoster = (item, type) => {
  if (type === 'games') return item.cover_url || item.banner_url;
  if (type === 'books') return item.cover_url;
  return item.poster_url || item.backdrop_url;
};

const getItemPath = (item, type) => {
  if (type === 'games') return `/games/${item.id}`;
  if (type === 'books') return `/books/${item.id}/read`;
  return `/media/${item.id}`;
};

function CollectionCard({ item, type, index }) {
  const poster = getPoster(item, type);
  const year = item.year || String(item.published_date || '').slice(0, 4);

  return (
    <Link to={getItemPath(item, type)} onMouseEnter={() => type !== 'books' && showWallpaperPreview(item, type)} onMouseLeave={hideWallpaperPreview} className="group block min-w-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/60">
        {poster ? (
          <img src={poster} alt={item.title} className="h-full w-full object-cover" loading={index < 8 ? 'eager' : 'lazy'} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
            {type === 'games' ? <Gamepad2 className="h-9 w-9 text-muted-foreground" /> : type === 'books' ? <BookOpen className="h-9 w-9 text-muted-foreground" /> : <Film className="h-9 w-9 text-muted-foreground" />}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Play className="h-4 w-4 fill-primary-foreground" />
          </div>
        </div>
        {item.rating > 0 && (
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-yellow-300 backdrop-blur">
            <Star className="h-3 w-3 fill-yellow-300" /> {Number(item.rating).toFixed(1)}
          </div>
        )}
      </div>
      <div className="mt-2 min-w-0">
        <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{year || item.source_type || item.content_type || 'In collection'}</p>
      </div>
    </Link>
  );
}

export default function CollectionTabs({ movies = [], tvShows = [], games = [], books = [] }) {
  const [active, setActive] = useState('movies');
  const collections = useMemo(() => ({ movies, tv: tvShows, games, books }), [movies, tvShows, games, books]);
  const activeTab = tabs.find(tab => tab.key === active) || tabs[0];
  const items = collections[active] || [];

  return (
    <section className="mx-auto mb-12 max-w-screen-2xl px-4 md:px-8">
      <div className="rounded-3xl border border-border bg-card/70 p-4 md:p-6 card-glow">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">My Collection</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">Browse by hub</h2>
          </div>
          <Link to={activeTab.path} className="text-sm font-bold text-primary hover:text-primary/80">View all {activeTab.label} →</Link>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Collection categories">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const count = collections[tab.key]?.length || 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-colors ${active === tab.key ? 'bg-primary text-primary-foreground' : 'border border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" /> {tab.label} <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/50 px-6 py-10 text-center text-sm text-muted-foreground">
            No {activeTab.label.toLowerCase()} in your collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {items.slice(0, 24).map((item, index) => <CollectionCard key={item.id} item={item} type={active} index={index} />)}
          </div>
        )}
      </div>
    </section>
  );
}