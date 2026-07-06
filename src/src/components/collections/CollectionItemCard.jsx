import { Link } from 'react-router-dom';
import { Check, Film, Gamepad2, Plus } from 'lucide-react';

export default function CollectionItemCard({ item, type, selected, onToggle, editable = false }) {
  const path = type === 'game' ? `/games/${item.id}` : `/media/${item.id}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <Link to={path} className="block aspect-[2/3] bg-secondary">
        {(item.poster_url || item.cover_url || item.banner_url) ? <img src={item.poster_url || item.cover_url || item.banner_url} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center">{type === 'game' ? <Gamepad2 className="h-8 w-8 text-primary" /> : <Film className="h-8 w-8 text-primary" />}</div>}
      </Link>
      <div className="p-3">
        <Link to={path} className="line-clamp-1 text-sm font-bold text-foreground hover:text-primary">{item.title}</Link>
        <p className="mt-1 text-xs text-muted-foreground">{type === 'game' ? 'Game' : item.type === 'tv_show' ? 'TV Show' : 'Movie'} {item.year ? `• ${item.year}` : ''}</p>
        {editable && (
          <button onClick={() => onToggle(item)} className={`mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-black ${selected ? 'bg-green-500/20 text-green-400' : 'bg-primary text-primary-foreground'}`}>
            {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {selected ? 'In Folder' : 'Add'}
          </button>
        )}
      </div>
    </article>
  );
}