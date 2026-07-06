import { Link } from 'react-router-dom';
import { Film, Folder, Gamepad2, Sparkles } from 'lucide-react';

export default function CollectionTile({ collection, media = [], games = [] }) {
  const coverItems = [...media, ...games].slice(0, 5);

  return (
    <Link to={`/collections/${collection.id}`} className="group block rounded-3xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Folder className="h-6 w-6" />
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">{media.length + games.length}</span>
      </div>
      <h3 className="text-xl font-black text-foreground group-hover:text-primary">{collection.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{collection.description || `${collection.collection_type || 'mixed'} collection folder`}</p>
      <div className="mt-4 flex items-center gap-3 text-xs font-bold text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Film className="h-3.5 w-3.5" /> {media.length} media</span>
        <span className="inline-flex items-center gap-1"><Gamepad2 className="h-3.5 w-3.5" /> {games.length} games</span>
      </div>
      <div className="mt-5 flex -space-x-2">
        {coverItems.length ? coverItems.map(item => (
          <div key={`${item.id}-${item.title}`} className="h-14 w-10 overflow-hidden rounded-lg border border-background bg-secondary">
            {(item.poster_url || item.cover_url || item.banner_url) ? <img src={item.poster_url || item.cover_url || item.banner_url} alt="" className="h-full w-full object-cover" /> : <Sparkles className="m-2 h-5 w-5 text-primary" />}
          </div>
        )) : <p className="text-xs text-muted-foreground">No items yet</p>}
      </div>
    </Link>
  );
}